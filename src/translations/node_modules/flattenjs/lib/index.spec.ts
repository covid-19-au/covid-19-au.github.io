var Flatten = require('./flatten');

var test = {
	a: 1,
	b: {
		a: {
			b: [0,1,2,3,{
				a: [1]
			}]
		}
	}
};

// var test = {
//     a: [[1]]
// };

console.log(JSON.stringify(Flatten.flatten(test), undefined, 2));