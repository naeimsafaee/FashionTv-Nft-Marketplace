module.exports = (raw) => {
	// const thisMappedProperties = raw.map((pro) => pro.properties);
	// const extractedUniqueKeys = {};
	// for (let i = 0; i < thisMappedProperties.length; i++) {
	// 	const thisProperyKeys = Object.keys(thisMappedProperties[i]);
	// 	for (let i = 0; i < thisProperyKeys; i++) {
	// 		if (!extractedUniqueKeys[i][thisProperyKeys]) {
	// 			extractedUniqueKeys;
	// 		}
	// 	}
	// }
	// const un = {};
	// for (let i = 0; i < thisMappedProperties.length; i++) {
	// 	const keys = Object.keys(thisMappedProperties[i]);
	// 	for (let j = 0; j < keys.length; j++) {
	// 		if (!un[keys[j]]) {
	// 			un[keys[j]] = { title: thisMappedProperties[i][keys[j]], count: 0 };
	// 		}
	// 		const thisUnKeyValues = Object.keys(un);
	// 		for (let k = 0; k < thisUnKeyValues.length; k++) {
	// 			if (un[thisUnKeyValues[k]].title == un[keys[j]].title) {
	// 				un[keys[j]].count++;
	// 			}
	// 		}
	// 	}
	// }
	const thisProperties = [];
	for (let i = 0; i < raw.length; i++) {
		const currentNftProperties = raw[i].properties;
		for (let j = 0; j < currentNftProperties.length; j++) {
			const currentNftProperty = currentNftProperties[j];
			const exist = thisProperties.find((thisPro) => thisPro.title == currentNftProperty.title);
			if (!exist) {
				thisProperties.push({
					title: currentNftProperty.title,
					values: [],
				});
			}

			const currentNftValues = currentNftProperty.values;
			const currentNftTitle = currentNftProperty.title;
			const thisProperty = thisProperties.findIndex((pro) => pro.title === currentNftTitle);
			for (let k = 0; k < currentNftValues.length; k++) {
				const currentValue = currentNftValues[k];
				const existValue = thisProperties[thisProperty].values.findIndex((val) => val.text === currentValue);
				if (existValue == -1) {
					thisProperties[thisProperty].values.push({
						text: currentValue,
						count: 1,
					});
				} else {
					thisProperties[thisProperty].values[existValue].count++;
				}
			}
		}

		// } else {
		// 	for (let k = 0; k < currentProperty.values.length; k++) {
		// 		const currentValue = currentProperty.values[k];
		// 		for (let n = 0; n < thisProperties.length; n++) {
		// 			const existValue = thisProperties[n].values.findIndex((val) => val.text == currentValue);
		// 			console.log("------------------------- CURRENTS");
		// 			console.log(currentProperty.title, thisProperties[n].title);
		// 			if (existValue != -1) {
		// 				console.log("=============-----------");
		// 				console.log(existValue);
		// 				thisProperties[n].values[existValue].count++;
		// 			}
		// 			if (currentProperty.title === thisProperties[n].title) {
		// 				thisProperties[n].values.push({
		// 					text: currentValue,
		// 					count: 1,
		// 				});
		// 			}
		// 		}
		// 	}
		// }
		// }
	}

	return thisProperties;
};

// let thisPropertiesObject = {};
// for (let i = 0; i < thisMappedProperties.length; i++) {
// 	const thisProperyKeys = Object.keys(thisMappedProperties[i]);
// 	for (let j = 0; j < thisProperyKeys.length; j++) {
// 		console.log(thisProperyKeys[j]);
// 		if (!thisPropertiesObject[thisProperyKeys[j]]) {
// 			thisPropertiesObject[thisProperyKeys[j]] = {
// 				count: 1,
// 				title: thisMappedProperties[i][thisProperyKeys[j]],
// 			};
// 		} else {
// 			const tempOK =  Object.keys(thisPropertiesObject)
// 			for (let k = 0; k <; k++) {
// 				if(thisPropertiesObject[k].title = )
// 			}
// 		}
// 	}
// }
// const thisProperties = tempProperties.map((pro) => {
// 	console.log(pro);
// 	return {
// 		[pro.properties]: pro,
// 	};
// });
// const replacedItems = tempProperties.map((obj) =>
// 	Object.fromEntries(Object.values(obj).map((val, i) => ["key" + (i + 1), val])),
// );
// console.log(replacedItems);
