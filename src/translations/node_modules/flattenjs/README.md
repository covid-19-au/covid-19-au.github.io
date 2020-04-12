# FlattenJS

A small simple library to easily flatten / unflatten JSON objects. Uses square brackets in path to preserve arrays.

> The path format works the same as [RSPath](https://www.npmjs.com/package/rspath).

## Installation

    npm install flattenjs --save

## Usage

    var FlattenJS = require('flattenjs');

    // Simple

    var obj = {
        a: true
    };

    var flattened = FlattenJS.convert(obj);
    console.log(flattened);
    // { a: true }

    var unflattened = FlattenJS.undo(flattened);
    console.log(unflattened);
    // { a: true }

    // Arrays

    obj = {
        a: true,
        b: {
            ba: [],
            bb: [0, 1, 2, 3, 4]
        }
    };

    flattened = FlattenJS.convert(obj);
    console.log(flattened);
    // {
    //     'a': true,
    //     'b.bb[0]': 0,
    //     'b.bb[1]': 1,
    //     'b.bb[2]': 2,
    //     'b.bb[3]': 3,
    //     'b.bb[4]': 4
    // }

    unflattened = FlattenJS.undo(flattened);
    console.log(unflattened);
    // { a: true, b: { bb: [ 0, 1, 2, 3, 4 ] } }

    // Arrays and Objects

    obj = {
        a: true,
        b: {
            ba: [{
                baa: [0, 1, 2, 3, 4]
            }, {
                bab: [0, 1, 2, 3, 4]
            }]
        }
    };

    flattened = FlattenJS.convert(obj);
    console.log(flattened);
    // {
    //     'a': true,
    //     'b.ba[0].baa[0]': 0,
    //     'b.ba[0].baa[1]': 1,
    //     'b.ba[0].baa[2]': 2,
    //     'b.ba[0].baa[3]': 3,
    //     'b.ba[0].baa[4]': 4,
    //     'b.ba[1].bab[0]': 0,
    //     'b.ba[1].bab[1]': 1,
    //     'b.ba[1].bab[2]': 2,
    //     'b.ba[1].bab[3]': 3,
    //     'b.ba[1].bab[4]': 4
    // }

    unflattened = FlattenJS.undo(flattened);
    console.log(unflattened);
