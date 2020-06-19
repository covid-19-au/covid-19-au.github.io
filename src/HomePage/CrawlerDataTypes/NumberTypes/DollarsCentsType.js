class DollarsCentsType extends NumberType {
    getPrettifiedValue() {

    }

    getCompactValue(digits) {
        // TODO: What could be done here!?
        //   It really needs the maximum/minimum values
    }

    getCanvasJSFormat() {
        return "$#,##0.00";
    }
}