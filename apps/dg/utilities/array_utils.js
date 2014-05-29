// ==========================================================================
//                            DG.ArrayUtils
// 
//  A collection of utilities for working with JavaScript Arrays.
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

DG.ArrayUtils = {

  /**
    Returns the index of the first array entry for which the specified
    match function returns true. Returns -1 if no match is found.
    @param    {Array}     The array in which to search for a match
    @param    {Function}  iMatchFunc: function( iArrayElement) { ... }
    @returns              index of first match or -1 if no match found
   */
  indexOfMatch: function( iArray, iMatchFunc) {
    var i, len = iArray.length;
    for( i = 0; i < len; ++i) {
      if( iMatchFunc( iArray[ i]))
        return i;
    }
    return -1;
  },

  /**
    Returns the index of the first array entry for which the specified
    match function returns true. Returns -1 if no match is found.
    @param    {Array}     The array in which to search for a match
    @param    {Function}  iMatchFunc: function( iArrayElement) { ... }
    @returns              index of first match or -1 if no match found
   */
  firstMatch: function( iArray, iMatchFunc) {
    var i, len = iArray.length;
    for( i = 0; i < len; ++i) {
      var element = iArray[ i];
      if( iMatchFunc( element))
        return element;
    }
    return null;
  },

  /**
    Numeric comparison function for use with Array.sort() or DG.ArrayUtils.binarySearch().
    Handles NaNs as follows: all NaNs compare equivalent to each other, greater than all
    non-NaN values so they get sorted at the end of the array.
    Note that non-numeric values are not handled at all.
    @param  {Number}  iFirst -- The first Number to compare
    @param  {Number}  iSecond -- The second Number to compare
    @returns  {Number}  -1 if iFirst < iSecond
                         0 if iFirst = iSecond
                         1 if iFirst > iSecond
   */
  numericComparator: function( iFirst, iSecond) {
    // Handle NaNs first -- NaNs compare equal to each other, at end.
    var firstNaN = isNaN( iFirst),
        secondNaN = isNaN( iSecond);
    if( firstNaN && secondNaN) return 0;
    if( firstNaN) return -1;
    if( secondNaN) return 1;
    // Handle regular values
    if( iFirst < iSecond) return -1;
    if( iFirst > iSecond) return 1;
    return 0;
  },

  /**
    Searches the specified array for the specified value using the comparison function.
    
    @param {Array} iArray   The Array to be searched
    @param {Object} iValue  The value to search for
    @param {Function}       The comparison function to use
    @returns {Number}       The index of the value in the array if found, -1 otherwise
   */
  binarySearch: function( iArray, iValue, iComparator) {
    if( !iArray || !iComparator) return -1;
    var low = 0, high = iArray.length - 1,
        i, comparison;
    while (low <= high) {
      i = Math.floor((low + high) / 2);
      comparison = iComparator(iArray[i], iValue);
      if (comparison < 0) low = i + 1;
      else if (comparison > 0) high = i - 1;
      else return i;
    }
    return -1;
  },

  /**
   * Returns the result of iMinuend minus iSubtrahend
   * Avoids o(n^2) by forming a hash whose keys are the id's returned for each element of
   * iMinuend using iGetIdF and whose values are the objects, removing the keys that are
   * found for elements of iSubtrahend, and finally forming an array of the remaining values
   * of the hash.
   *
   * Note that if there is nothing to subtract, we return the original array. If you want to make
   * use of the returned array without changing the original, you'll have to make your own copy.
   *
   * @param iMinuend {Array}
   * @param iSubtrahend {Array}
   * @param iGetIdF {Function}
   * @returns {Array} the difference, elements in iMinuend that are not in iSubtrahend
   */
  subtract: function( iMinuend, iSubtrahend, iGetIdF) {
    var tDifference = [],
        tHash = {};
    if(!iSubtrahend || iSubtrahend.length === 0)
      return iMinuend;

    iMinuend.forEach( function( iElement) {
      tHash[ iGetIdF (iElement)] = iElement;
    });
    iSubtrahend.forEach( function( iElement) {
      delete tHash[ iGetIdF( iElement)];
    });
    DG.ObjectMap.forEach( tHash, function( iKey) {
      tDifference.push( tHash[ iKey]);
    });
    return tDifference;
  }

};

