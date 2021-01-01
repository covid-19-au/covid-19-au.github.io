import tinycolor from "tinycolor2";
import ECHARTS_DARK_THEME from "./echarts_dark_theme.json";
import ECHARTS_LIGHT_THEME from "./echarts_light_theme.json";


let COLOR_SCHEME_DARK = 0,
    COLOR_SCHEME_LIGHT = 1;


let COLOR_SCHEMES = {};

COLOR_SCHEMES[COLOR_SCHEME_DARK] = {
    'eChartsTheme': ECHARTS_DARK_THEME,
    'hyperlink': tinycolor('#1277d3'),
    'hoverRectangle': tinycolor("rgb(6,25,150)"),
    //'waterColor': tinycolor('#a0cfdf'),
    'cases': {
        'default': {
            'text': tinycolor('white'),
            'max': tinycolor('#ffffff'),
            'positive': [tinycolor('#11235e'), tinycolor('#b4c3ff')],
            'negative': [tinycolor('rgb(46,110,15)'), tinycolor('rgb(164, 192, 160)')],
            'noData': tinycolor('rgba(0, 0, 0, 0.0)'),
            'zero': tinycolor('rgba(0, 0, 0, 0.0)')
        },
        'textHalo': {
            'text': tinycolor('black'),
            'max': tinycolor('rgba(0, 0, 0, 1.0)'),
            // TODO: Do something about opacity
            'positive': [tinycolor('rgb(0, 0, 0)'), tinycolor('rgb(0, 0, 0)')],
            'negative': [tinycolor('rgb(0, 0, 0)'), tinycolor('rgb(0, 0, 0)')],
            'noData': tinycolor('rgba(255, 255, 255, 0.0)'),
            'zero': tinycolor('rgba(255, 255, 255, 0.0)'),
        }
    },
    'caseText': {
        'area': tinycolor('white'),
        'areaHalo': tinycolor('black'),
        'casesNumber': tinycolor('black')
    },
    'statusTexts': {
        'confirmed': tinycolor('rgb(255, 96, 60)'),
        'deaths': tinycolor('rgb(193, 23, 0)'),
        'recovered': tinycolor('rgb(0, 193, 119)'),
        'tested': tinycolor('rgb(0, 124, 242)'),
        'active': tinycolor('rgb(247, 92, 141)'),
        'inHospital': tinycolor('rgb(157, 113, 234)'),
        'inICU': tinycolor('rgb(0, 170, 193)'),
        'noNewCases': tinycolor("#00c177")
    }
};

COLOR_SCHEMES[COLOR_SCHEME_LIGHT] = {
    'eChartsTheme': 'default',
    'hyperlink': tinycolor('#00f'),
    'hoverRectangle': tinycolor("rgb(6,25,150)"),
    'waterColor': tinycolor('#9bc1d9'),
    'cases': {
        'default': {
            'text': tinycolor('white'),
            'max': tinycolor('#1046e7').darken(20),
            'positive': [tinycolor('#859fff'), tinycolor('#1046e7')],
            'negative': [tinycolor('rgb(164, 192, 160)'), tinycolor('rgb(46, 110, 15)')],
            'noData': tinycolor('rgba(0, 0, 0, 0.0)'),
            'zero': tinycolor('rgba(0, 0, 0, 0.0)')
        },
        'textHalo': {
            'text': tinycolor('white'),
            'max': tinycolor('rgba(255, 255, 255, 1.0)'),
            // TODO: Do something about opacity
            'positive': [tinycolor('rgb(255, 255, 255)'), tinycolor('rgb(255, 255, 255)')],
            'negative': [tinycolor('rgb(255, 255, 255)'), tinycolor('rgb(255, 255, 255)')],
            'noData': tinycolor('rgba(0, 0, 0, 0.0)'),
            'zero': tinycolor('rgba(0, 0, 0, 0.0)'),
        }
    },
    'caseText': {
        'area': tinycolor('black'),
        'areaHalo': tinycolor('white'),
        'casesNumber': tinycolor('white')
    },
    'statusTexts': {
        'confirmed': tinycolor('rgb(255, 96, 60)'),
        'deaths': tinycolor('rgb(193, 23, 0)'),
        'recovered': tinycolor('rgb(0, 193, 119)'),
        'tested': tinycolor('rgb(0, 124, 242)'),
        'active': tinycolor('rgb(247, 92, 141)'),
        'inHospital': tinycolor('rgb(157, 113, 234)'),
        'inICU': tinycolor('rgb(0, 170, 193)'),
        'noNewCases': tinycolor("#00c177")
    }
};


class ColorManagement {
    COLOR_SCHEME_DARK = COLOR_SCHEME_DARK;
    COLOR_SCHEME_LIGHT = COLOR_SCHEME_LIGHT;

    /**
     *
     */
    constructor() {
        // dark-mode media query matched or not
        this.__preferredColorSchemeType =
            window.matchMedia('(prefers-color-scheme: dark)').matches ?
                COLOR_SCHEME_DARK : COLOR_SCHEME_LIGHT;
        this.__colorSchemeType =
            localStorage['colorSchemeType'] || this.__preferredColorSchemeType;
        this.__colorSchemeType = parseInt(this.__colorSchemeType);
        this.__colorScheme = COLOR_SCHEMES[this.__colorSchemeType];
    }

    /*****************************************************************
     * Miscellaneous
     *****************************************************************/

    /**
     *
     * @param i
     * @returns {number|*}
     * @private
     */
    __pc(i) {
        if (i < 0) throw "";
        else if (i > 100) throw "";
        else if (i <= 1.0) return i;
        else throw ""
    }

    /**
     *
     * @param toColor
     * @param fromColor
     * @param pc
     * @returns {*}
     */
    blendColors(toColor, fromColor, pc) {
        pc = this.__pc(pc);

        if (fromColor._a == null)
            fromColor._a = 1.0;
        if (toColor._a == null)
            toColor._a = 1.0;

        let color1 = [
            fromColor._r*pc, fromColor._g*pc, fromColor._b*pc, fromColor._a*pc
        ];
        let color2 = [
            toColor._r*(1.0-pc), toColor._g*(1.0-pc), toColor._b*(1.0-pc),
            toColor._a*(1.0-pc)
        ];

        //console.log(fromColor.toString()+' '+toColor.toString()+' '+pc)
        //console.log(JSON.stringify(color1)+' '+JSON.stringify(color2))

        return tinycolor(
            `rgba(`+
                `${Math.round(color1[0]+color2[0])}, `+
                `${Math.round(color1[1]+color2[1])}, `+
                `${Math.round(color1[2]+color2[2])}, `+
                `${color1[3]+color2[3]}`+
            `)`
        );
    }

    /*****************************************************************
     * Base color-scheme stuff
     *****************************************************************/

    /**
     *
     * @returns {*|number}
     */
    getColorSchemeType() {
        return this.__colorSchemeType;
    }

    /**
     *
     * @returns {number}
     */
    getPreferredColorSchemeType() {
        return this.__preferredColorSchemeType;
    }

    /**
     *
     * @param colorSchemeType
     */
    setColorSchemeType(colorSchemeType) {
        localStorage['colorSchemeType'] = colorSchemeType;
        window.location.reload();
    }

    /**
     *
     * @returns {*}
     */
    getEChartsTheme() {
        return this.__colorScheme['eChartsTheme'];
    }

    /*****************************************************************
     * Case colors
     *****************************************************************/

    /**
     *
     * @param key
     * @returns {*}
     */
    getCaseTextColor(key) {
        return this.__colorScheme['caseText'][key];
    }

    /**
     *
     * @returns {*}
     */
    getHoverRectangleColor() {
        return this.__colorScheme['hoverRectangle'];
    }

    /**
     *
     * @returns {*}
     */
    getCaseColorNoData(key) {
        key = key || 'default';
        return this.__colorScheme['cases'][key]['noData'];
    }

    /**
     *
     * @returns {*}
     */
    getCaseColorMax(key) {
        key = key || 'default';
        return this.__colorScheme['cases'][key]['max'];
    }

    /**
     *
     * @param percent
     * @returns {*}
     */
    getCaseColorPositive(pc, key) {
        key = key || 'default';
        if (!pc) {
            return this.__colorScheme['cases'][key]['zero'];
        } else {
            pc = this.__pc(pc);
            let [fromColor, toColor] = this.__colorScheme['cases'][key]['positive'];
            return this.blendColors(fromColor, toColor, this.__pc(pc))
        }
    }

    /**
     *
     * @param percent
     * @returns {*}
     */
    getCaseColorNegative(pc, key) {
        key = key || 'default';

        if (!pc) {
            return this.__colorScheme['cases'][key]['zero'];
        } else {
            let [fromColor, toColor] = this.__colorScheme['cases'][key]['negative'];
            return this.blendColors(fromColor, toColor, this.__pc(pc))
        }
    }

    /*****************************************************************
     * Various controls
     *****************************************************************/

    /**
     *
     * @returns {{color: (string)}}
     */
    getPillButtonColors(active) {
        return active ? {
            fontWeight: 'bold',
            color: this.getTextColor(),
            borderColor: "#8ccfff",
            padding: "0px",
            outline: "none",
            zIndex: 10,
        } : {
            color: this.getColorSchemeType() === COLOR_SCHEME_LIGHT ?
                '#666' : '#bbb',
            borderColor: "#e3f3ff",
            padding: "0px",
            outline: "none",
        };
    }

    /*****************************************************************
     * Other colors
     *****************************************************************/

    /**
     *
     * @returns {*}
     */
    getHyperlinkColor() {
        return this.__colorScheme['hyperlink'];
    }

    /**
     *
     * @param key
     * @returns {*}
     */
    getStatusTextColor(key) {
        if (!(key in this.__colorScheme['statusTexts'])) {
            throw `KeyError: ${key}`
        }
        return this.__colorScheme['statusTexts'][key];
    }

    /**
     *
     * @returns {*}
     */
    getWaterColor() {
        return this.__colorScheme['waterColor'];
    }

    getTextColor() {
        return this.getColorSchemeType() === COLOR_SCHEME_LIGHT ?
            'black' : 'white'
    }

    getBackgroundColor() {
        return this.getColorSchemeType() === COLOR_SCHEME_LIGHT ?
            'white' : 'black'
    }
}

export default new ColorManagement();
