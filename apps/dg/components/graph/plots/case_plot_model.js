// ==========================================================================
//                          DG.CasePlotModel
//
//  This is the "empty" plot that shows one icon per case
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

/** @class  DG.CasePlotModel

  @extends DG.PlotModel
*/
DG.CasePlotModel = DG.PlotModel.extend(
/** @scope DG.CasePlotModel.prototype */ 
{
  /**
   * @property{Array of {x: {Number} y: {Number}}
   */
  worldValues: null,

  /**
   *
   * @param iIndex {Number}
   * @return { x:{Number}, y:{Number} }
   */
  getWorldCoords: function( iIndex) {
    if( SC.none( this.worldValues))
      this.worldValues = [];

    var tWorldValues = this.worldValues;
    if( (iIndex >= tWorldValues.length) || SC.none( tWorldValues[ iIndex]))
      tWorldValues[ iIndex] = { x: Math.random(), y: Math.random() };

    return tWorldValues[ iIndex];
  },

  /**
   *
   * @param iIndex {Number}
   * @param { x:{Number}, y:{Number} }
   */
  setWorldCoords: function( iIndex, iWorldValues) {
    if( SC.none( this.worldValues))
      this.worldValues = [];

    this.worldValues[ iIndex] = iWorldValues;
  },

  /**
   * Assign new random values to the coordinates.
   */
  mixUp: function() {
    this.set('worldValues', []);
  },

  /**
   *
   * @return {Array of menu items}
   */
  getGearMenuItems: function() {
    var this_ = this;
    return [
      { title: 'DG.PlotModel.mixup', target: this_, itemAction: this_.mixUp, localize: true }
    ].concat( sc_super());
  },

  /**
   * Get an array of non-missing case counts in each axis cell.
   * Also cell index on primary and secondary axis, with primary axis as major axis.
   * @return {Array} [{count, primaryCell, secondaryCell},...] (all values are integers 0+).
   */
  getCellCaseCounts: function() {
    // assumes a single row and column axis cell and no missing cases
    var tValueArray = [];
    var tCases = this.get('cases');
    var tNumCases = tCases.length;
    tValueArray.push( {
        count: tNumCases,
        primaryCell: 0,
        secondaryCell: 0
      });
    return tValueArray;
   }

});

