// ==========================================================================
//                          DG.DotChartModel
//
//  Author:   William Finzer
//
//  Copyright (c) 2014 by The Concord Consortium, Inc. All rights reserved.
//
//  Licensed under the Apache License, Version 2.0 (the "License");
//  you may not use this file except in compliance with the License.
//  You may obtain a copy of the License at
//
//    http://www.apache.org/licenses/LICENSE-2.0
//
//  Unless required by applicable law or agreed to in writing, software
//  distributed under the License is distributed on an "AS IS" BASIS,
//  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
//  See the License for the specific language governing permissions and
//  limitations under the License.
// ==========================================================================

sc_require('components/graph/plots/plot_model');

/** @class  DG.DotChartModel - The model for a plot with categorical axes

  @extends SC.Object
*/
DG.DotChartModel = DG.PlotModel.extend(
/** @scope DG.DotChartModel.prototype */ 
{

  /**
  @property{DG.GraphTypes.EPlace}
  */
  primaryAxisPlace: function() {
    var dataConfiguration = this.get('dataConfiguration');
    return dataConfiguration && dataConfiguration.getPlaceForRole( DG.Analysis.EAnalysisRole.ePrimaryCategorical);
  }.property('xVarID', 'yVarID'),

  /**
  @property{DG.GraphTypes.EPlace}
  */
  secondaryAxisPlace: function() {
    var dataConfiguration = this.get('dataConfiguration');
    return dataConfiguration && dataConfiguration.getPlaceForRole( DG.Analysis.EAnalysisRole.eSecondaryCategorical);
  }.property('xVarID', 'yVarID'),

/**
  @property{DG.CellAxisModel}
  */
  primaryAxisModel: function() {
    return this.getAxisForPlace( this.get('primaryAxisPlace'));
  }.property('primaryAxisPlace', 'xAxis', 'yAxis'),

/**
  @property{DG.CellAxisModel}
  */
  secondaryAxisModel: function() {
    return this.getAxisForPlace( this.get('secondaryAxisPlace'));
  }.property('secondaryAxisPlace', 'xAxis', 'yAxis'),

  /**
    'vertical' means the stacks of dots are vertical, while 'horizontal' means they are horizontal
    @property{String}
    */
    orientation: function() {
      return (this.get('primaryAxisPlace') === DG.GraphTypes.EPlace.eX) ? 'vertical' : 'horizontal';
    }.property(),

    /**
    @property{SC.Array of SC.Array of SC.Array of {theCase, caseIndex}}
  */
  cachedCells: null,

  /**
    Reverse lookup. Indexed by case index.
    @property{SC.Array of {primaryCell, primaryCell, indexInCell}}
  */
  cachedIndex: null,

  /**
    @property{Number} The maximum number of cases in any cell
  */
  maxInCell: function() {
    if( !this._cacheIsValid)
      this._buildCache();
    return this._maxInCell;
  }.property(),

  /**
    Responder for DataContext notifications. The PlotModel does not
    receive DataContext notifications directly, however. Instead, it
    receives them from the GraphModel, which receives them directly
    from the DataContext.
   */
  handleDataContextNotification: function( iNotifier, iChange) {
    if( !this.isAffectedByChange( iChange))
      return;

    var addToCache = function( iCase, iIndex, iPrimaryCell, iSecondaryCell) {
      var tCellLength;
      if(SC.none( iPrimaryCell) || SC.none( iSecondaryCell))
        return;

      var tCachedCells = this.get('cachedCells' ),
          tCachedIndex = this.get('cachedIndex' ),
          tMaxInCell = this.get('_maxInCell');

      if( SC.none( tCachedCells[ iPrimaryCell]))
        tCachedCells[ iPrimaryCell] = [];
      if( SC.none( tCachedCells[ iPrimaryCell][ iSecondaryCell]))
        tCachedCells[ iPrimaryCell][ iSecondaryCell] = [];
      tCachedCells[ iPrimaryCell][iSecondaryCell].push( { theCase: iCase, caseIndex: iIndex });
      tCellLength = tCachedCells[ iPrimaryCell][ iSecondaryCell].length;
      tCachedIndex[ iIndex] = { primaryCell: iPrimaryCell, secondaryCell: iSecondaryCell, indexInCell: tCellLength - 1 };
      this.beginPropertyChanges();
        this.set('cachedCells', tCachedCells);
        this.set('cachedIndex', tCachedIndex);
        this.set('_maxInCell', Math.max( tMaxInCell, tCellLength));
      this.endPropertyChanges();
    }.bind( this);

    if( (iChange.operation === 'createCase') || (iChange.operation === 'createCases')) {
      var tCaseIDs = iChange.result.caseIDs || [ iChange.result.caseID ],
          tIndex = this.getPath('dataConfiguration.cases.length') - 1,
          tCC = this.get('computationContext' );
      tCaseIDs.forEach( function( iCaseID) {
                          var tCase = DG.store.find( DG.Case, iCaseID);
                          this.doForOneCase( tCase, tIndex++, tCC, addToCache);
                        }.bind( this));
    }
    else
      this.invalidateCaches();

    sc_super(); // Call this last because it results in view update, which we're not ready to do first
  },

  /**
    With this iteration we pass to the given function the index of the case in the cell.
    @return {{primaryCell, secondaryCell, indexInCell}}
  */
  lookupCellForCaseIndex: function( iIndex) {
    if( !this._cacheIsValid)
      this._buildCache();
    return this.get('cachedIndex')[ iIndex];
  },

  /**
   * If SC's property caching worked the way we would like it to, we wouldn't need this private property.
   * As it is, we store a cached computation context here, nulling it out by hand when caches must be
   * invalidated.
   */
  _cachedComputationContext: null,

  /**
   * Caching this computation context allows us to save a lot of 'gets'
   * @property{Object}
   */
  computationContext: function() {
    if( !this._cachedComputationContext) {
      this._cachedComputationContext = {
        primaryAxis: this.get('primaryAxisModel'),
        secondaryAxis: this.get('secondaryAxisModel'),
        primaryVarID: this.get('primaryVarID'),
        secondaryVarID: this.get('secondaryVarID'),
        legendVarID: this.get('legendVarID')
      };
    }
    return this._cachedComputationContext;
  }.property('primaryAxisModel', 'secondaryAxisModel', 'primaryVarID', 'secondaryVarID', 'legendVarID' ),

  doForOneCase: function( iCase, iIndex, iCC, iDoF) {
    var tPrimaryVal = iCase.getValue( iCC.primaryVarID),
        tPrimaryIsValid = SC.none( iCC.primaryVarID) || !SC.none( tPrimaryVal),
        tSecondaryVal = iCase.getValue( iCC.secondaryVarID),
        tSecondaryIsValid = SC.none( iCC.secondaryVarID) || !SC.none( tSecondaryVal),
        tLegendVal = iCase.getValue( iCC.legendVarID),
        tLegendIsValid = SC.none( iCC.legendVarID) || !SC.none( tLegendVal),
        tPrimaryCell, tSecondaryCell;
    if( tPrimaryIsValid && tSecondaryIsValid && tLegendIsValid) {
      tPrimaryCell = iCC.primaryAxis.cellNameToCellNumber( tPrimaryVal);
      tSecondaryCell = iCC.secondaryAxis.cellNameToCellNumber( tSecondaryVal);
      iDoF( iCase, iIndex, tPrimaryCell, tSecondaryCell);
    }
  },
  
  /**
    Call the given function once for each case that has a value for each axis.
    function signature for iDoF is { iCase, iCaseIndex, iPrimaryCellIndex, iSecondaryCellIndex }
  */
  forEachBivariateCaseDo: function( iDoF) {
    var tCases = this.get('cases'),
        tCC = this.get('computationContext');
    if( !tCC.primaryAxis || !tCases)
      return; // Can happen during transitions. Bail!
    tCases.forEach( function( iCase, iIndex) {
      this.doForOneCase( iCase, iIndex, tCC, iDoF);
    }.bind(this));
  },
  
  /**
    My data has changed, so my cache is no longer valid.
  */
  invalidateCaches: function() {
    sc_super();
    this.set('_cacheIsValid', false);
    this._cachedComputationContext = null;
  },

  /**
   * Get an array of non-missing case counts in each axis cell.
   * Also cell index on primary and secondary axis, with primary axis as major axis.
   * @return {Array} [{count, primaryCell, secondaryCell},...] (all values are integers 0+).
   */
  getCellCaseCounts: function() {
    var tAxis1 = this.get('primaryAxisModel'),
        tAxis2 = this.get('secondaryAxisModel'),
        tValueArray = [];

    if( !( tAxis1 && tAxis2 )) {
      return tValueArray; // too early to recompute, caller must try again later.
    }
    var tNumCells1 = tAxis1.get('numberOfCells') || 1,
        tNumCells2 = tAxis2.get('numberOfCells') || 1;
    var totalCells = tNumCells1*tNumCells2;
    var i, tCellIndex;

    // initialize the values
    for( i=0; i<totalCells; ++i ) {
      tValueArray.push({ count: 0, primaryCell: Math.floor(i/tNumCells2), secondaryCell: i%tNumCells2 });
    }

    // compute count of cases in each cell, excluding missing values
    this.forEachBivariateCaseDo( function( iCase, iIndex, iPrimaryCell, iSecondaryCell) {
      tCellIndex = iPrimaryCell*tNumCells2 + iSecondaryCell;
      if( DG.MathUtilities.isInIntegerRange( tCellIndex, 0, totalCells )) {
        var iValue = tValueArray[ tCellIndex ];
        iValue.count += 1;
        DG.assert( iValue.primaryCell === (iPrimaryCell || 0), "primary cell index error in DG.DotChartModel.getCellCaseCounts()" );
        DG.assert( iValue.secondaryCell === (iSecondaryCell || 0), "secondary cell index error in DG.DotChartModel.getCellCaseCounts()" );
      }
    });

    return tValueArray;
  },
 
  /**
    Build a sparse 3-dim matrix of cases.
  */
  _buildCache: function() {
    var tCachedCells = [],
        tCachedIndex = [],
        tMaxInCell = 0;
    this.forEachBivariateCaseDo( function( iCase, iIndex, iPrimaryCell, iSecondaryCell) {
      var tCellLength;
      if(SC.none( iPrimaryCell) || SC.none( iSecondaryCell))
        return;

      if( SC.none( tCachedCells[ iPrimaryCell]))
        tCachedCells[ iPrimaryCell] = [];
      if( SC.none( tCachedCells[ iPrimaryCell][ iSecondaryCell]))
        tCachedCells[ iPrimaryCell][ iSecondaryCell] = [];
      tCachedCells[ iPrimaryCell][iSecondaryCell].push( { theCase: iCase, caseIndex: iIndex });
      tCellLength = tCachedCells[ iPrimaryCell][ iSecondaryCell].length;
      tCachedIndex[ iIndex] = { primaryCell: iPrimaryCell, secondaryCell: iSecondaryCell, indexInCell: tCellLength - 1 };
      tMaxInCell = Math.max( tMaxInCell, tCellLength);
    });
    this._cacheIsValid = true;
    this.beginPropertyChanges();
      this.set('cachedCells', tCachedCells);
      this.set('cachedIndex', tCachedIndex);
      this.set('_maxInCell', tMaxInCell);
    this.endPropertyChanges();
  },
  
  /**
    @property{Boolean}
    @private
  */
  _cacheIsValid: false,
  /**
    @property{Number}
    @private
  */
  _maxInCell: 0

});

/**
  class method called before plot creation to make sure roles are correct
  @param {DG.GraphDataConfiguration}
*/
DG.DotChartModel.configureRoles = function( iConfig) {
  var tXType = iConfig.get('xType'),
      tAxisKey = (tXType === DG.Analysis.EAttributeType.eCategorical) ? 'x' : 'y',
      tOtherAxisKey = (tAxisKey === 'x') ? 'y' : 'x';
  iConfig.setPath( tAxisKey + 'AttributeDescription.role',
                    DG.Analysis.EAnalysisRole.ePrimaryCategorical);
  iConfig.setPath( tOtherAxisKey + 'AttributeDescription.role',
                    DG.Analysis.EAnalysisRole.eSecondaryCategorical);
};
