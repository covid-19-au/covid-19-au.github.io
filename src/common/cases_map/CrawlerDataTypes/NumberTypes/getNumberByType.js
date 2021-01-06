function getNumberByType(type, value) {
    switch (type) {
        case 'number': return new NumberType(value);
        case 'percent': return new PercentageType(value);
        case 'dollars': return new DollarsType(value);
        case 'float': return new FloatType(value);
        case 'integer': return new IntegerType(value);
        case 'per100k': return new Per100kType(value);
        default: throw `Unknown number type ${type}`;
    }
}
