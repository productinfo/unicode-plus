//
const fs = require ('fs');
const path = require ('path');
//
const unicodeData = require ('./parsed-unicode-data.js');
const extraData = require ('./parsed-extra-data.js');
//
const characterCount = Object.keys (unicodeData).length;
//
const planes =
[
    { name: "Basic Multilingual Plane (BMP)", first: "0000", last: "FFFF" },
    { name: "Supplementary Multilingual Plane (SMP)", first: "10000", last: "1FFFF" },
    { name: "Supplementary Ideographic Plane (SIP)", first: "20000", last: "2FFFF" },
    { name: "Tertiary Ideographic Plane (TIP)", first: "30000", last: "3FFFF" },
    // { name: "Unassigned", first: "40000", last: "DFFFF" },
    { name: "Supplementary Special-purpose Plane (SSP)", first: "E0000", last: "EFFFF" },
    { name: "Supplementary Private Use Area-A", first: "F0000", last: "FFFFF" },
    { name: "Supplementary Private Use Area-B", first: "100000", last: "10FFFF" }
];
//
//　https://www.unicode.org/Public/UNIDATA/PropertyValueAliases.txt
// https://www.unicode.org/Public/UNIDATA/extracted/DerivedGeneralCategory.txt
const categories =
{
    "Lu": "Uppercase Letter",           // an uppercase letter
    "Ll": "Lowercase Letter",           // a lowercase letter
    "Lt": "Titlecase Letter",           // a digraphic character, with first part uppercase
    "LC": "Cased Letter",               // Lu | Ll | Lt
    "Lm": "Modifier Letter",            // a modifier letter
    "Lo": "Other Letter",               // other letters, including syllables and ideographs
    "L": "Letter",                      // Lu | Ll | Lt | Lm | Lo
    //
    "Mn": "Nonspacing Mark",           // a nonspacing combining mark (zero advance width)
    "Mc": "Spacing Mark",               // a spacing combining mark (positive advance width)
    "Me": "Enclosing Mark",             // an enclosing combining mark
    "M": "Mark",                        // Mn | Mc | Me
    //
    "Nd": "Decimal Number",             // a decimal digit
    "Nl": "Letter Number",              // a letterlike numeric character
    "No": "Other Number",               // a numeric character of other type
    "N": "Number",                      // Nd | Nl | No
    //
    "Pc": "Connector Punctuation",      // a connecting punctuation mark, like a tie
    "Pd": "Dash Punctuation",           // a dash or hyphen punctuation mark
    "Ps": "Open Punctuation",           // an opening punctuation mark (of a pair)
    "Pe": "Close Punctuation",          // a closing punctuation mark (of a pair)
    "Pi": "Initial Punctuation",        // an initial quotation mark
    "Pf": "Final Punctuation",          // a final quotation mark
    "Po": "Other Punctuation",          // a punctuation mark of other type
    "P": "Punctuation",                 // Pc | Pd | Ps | Pe | Pi | Pf | Po
    //
    "Sm": "Math Symbol",                // a symbol of mathematical use
    "Sc": "Currency Symbol",            // a currency sign
    "Sk": "Modifier Symbol",            // a non-letterlike modifier symbol
    "So": "Other Symbol",               // a symbol of other type
    "S": "Symbol",                      // Sm | Sc | Sk | So
    //
    "Zs": "Space Separator",            // a space character (of various non-zero widths)
    "Zl": "Line Separator",             // U+2028 LINE SEPARATOR only
    "Zp": "Paragraph Separator",        // U+2029 PARAGRAPH SEPARATOR only
    "Z": "Separator",                   // Zs | Zl | Zp
    //
    "Cc": "Control",                    // a C0 or C1 control code
    "Cf": "Format",                     // a format control character
    "Cs": "Surrogate",                  // a surrogate code point
    "Co": "Private Use",                // a private-use character
    "Cn": "Unassigned",                 // a reserved unassigned code point or a noncharacter (no characters in the file have this property)
    "C": "Other"                        // Cc | Cf | Cs | Co | Cn
};
//
// https://www.unicode.org/Public/UNIDATA/extracted/DerivedCombiningClass.txt
const combiningClasses =
{
    "0": "Not Reordered",           // Spacing and enclosing marks; also many vowel and consonant signs, even if nonspacing
    "1": "Overlay",                 // Marks which overlay a base letter or symbol
    "7": "Nukta",                   // Diacritic nukta marks in Brahmi-derived scripts
    "8": "Kana Voicing",            // Hiragana/Katakana voicing marks
    "9": "Virama",                  // Viramas
    //
    "10": "CCC10",
    "11": "CCC11",
    "12": "CCC12",
    "13": "CCC13",
    "14": "CCC14",
    "15": "CCC15",
    "16": "CCC16",
    "17": "CCC17",
    "18": "CCC18",
    "19": "CCC19",
    "20": "CCC20",
    "21": "CCC21",
    "22": "CCC22",
    "23": "CCC23",
    "24": "CCC24",
    "25": "CCC25",
    "26": "CCC26",
    "27": "CCC28",
    "29": "CCC29",
    "30": "CCC30",
    "31": "CCC31",
    "32": "CCC32",
    "33": "CCC33",
    "34": "CCC34",
    "35": "CCC35",
    "36": "CCC36",
    "84": "CCC84",
    "91": "CCC91",
    "103": "CCC103",
    "107": "CCC107",
    "118": "CCC118",
    "122": "CCC122",
    "129": "CCC129",
    "130": "CCC130",
    "132": "CCC132",
    //
    "200": "Attached Below Left",   // Marks attached at the bottom left
    "202": "Attached Below",        // Marks attached directly below
    "204": "Attached Below Right",  // Marks attached at the bottom right
    "208": "Attached Left",         // Marks attached to the left
    "210": "Attached Right",        // Marks attached to the right
    "212": "Attached Above Left",   // Marks attached at the top left
    "214": "Attached Above",        // Marks attached directly above
    "216": "Attached Above Right",  // Marks attached at the top right
    "218": "Below Left",            // Distinct marks at the bottom left
    "220": "Below",                 // Distinct marks directly below
    "222": "Below Right",           // Distinct marks at the bottom right
    "224": "Left",                  // Distinct marks to the left
    "226": "Right",                 // Distinct marks to the right
    "228": "Above Left",            // Distinct marks at the top left
    "230": "Above",                 // Distinct marks directly above
    "232": "Above Right",           // Distinct marks at the top right
    "233": "Double Below",          // Distinct marks subtending two bases
    "234": "Double Above",          // Distinct marks extending above two bases
    "240": "Iota Subscript"         // Greek iota subscript only
};
//
// https://www.unicode.org/Public/UNIDATA/extracted/DerivedBidiClass.txt
const bidiClasses =
{
    "L": "Left-to-Right",               // any strong left-to-right character
    "LRE": "Left-to-Right Embedding",   // U+202A: the LR embedding control
    "LRO": "Left-to-Right Override",    // U+202D: the LR override control
    "R": "Right-to-Left",               // any strong right-to-left (non-Arabic-type) character
    "AL": "Arabic Letter",              // any strong right-to-left (Arabic-type) character
    "RLE": "Right-to-Left Embedding",   // U+202B: the RL embedding control
    "RLO": "Right-to-Left Override",    // U+202E: the RL override control
    "PDF": "Pop Directional Format",    // U+202C: terminates an embedding or override control
    "EN": "European Number",            // any ASCII digit or Eastern Arabic-Indic digit
    "ES": "European Separator",         // plus and minus signs
    "ET": "European Terminator",        // a terminator in a numeric format context, includes currency signs
    "AN": "Arabic Number",              // any Arabic-Indic digit
    "CS": "Common Separator",           // commas, colons, and slashes
    "NSM": "Nonspacing Mark",           // any nonspacing mark
    "BN": "Boundary Neutral",           // most format characters, control codes, or noncharacters
    "B": "Paragraph Separator",         // various newline characters
    "S": "Segment Separator",           // various segment-related control codes
    "WS": "White Space",                // spaces
    "ON": "Other Neutral",              // most other symbols and punctuation marks
    //
    "LRI": "Left-to-Right Isolate",     // U+2066: the LR isolate control
    "RLI": "Right-to-Left Isolate",     // U+2067: the RL isolate control
    "FSI": "First Strong Isolate ",     // U+2068: the first strong isolate control
    "PDI": "Pop Directional Isolate"    // U+2069: terminates an isolate control
};
//
const mirrored =
{
    "N": "",    // Skip field if "No"...
    "Y": "Yes"
}
//
// https://www.unicode.org/Public/UNIDATA/PropertyValueAliases.txt
const scripts =
{
    "Adlm": "Adlam",
    "Ahom": "Ahom",
    "Hluw": "Anatolian Hieroglyphs",
    "Arab": "Arabic",
    "Armn": "Armenian",
    "Avst": "Avestan",
    "Bali": "Balinese",
    "Bamu": "Bamum",
    "Bass": "Bassa Vah",
    "Batk": "Batak",
    "Beng": "Bengali",
    "Bhks": "Bhaiksuki",
    "Bopo": "Bopomofo",
    "Brah": "Brahmi",
    "Brai": "Braille",
    "Bugi": "Buginese",
    "Buhd": "Buhid",
    "Cans": "Canadian Aboriginal",
    "Cari": "Carian",
    "Aghb": "Caucasian Albanian",
    "Cakm": "Chakma",
    "Cham": "Cham",
    "Cher": "Cherokee",
    "Zyyy": "Common",
    "Copt": "Coptic",
    "Qaac": "Coptic",   // alias?
    "Xsux": "Cuneiform",
    "Cprt": "Cypriot",
    "Cyrl": "Cyrillic",
    "Dsrt": "Deseret",
    "Deva": "Devanagari",
    "Dogr": "Dogra",
    "Dupl": "Duployan",
    "Egyp": "Egyptian Hieroglyphs",
    "Elba": "Elbasan",
    "Ethi": "Ethiopic",
    "Geor": "Georgian",
    "Glag": "Glagolitic",
    "Goth": "Gothic",
    "Gran": "Grantha",
    "Grek": "Greek",
    "Gujr": "Gujarati",
    "Gong": "Gunjala Gondi",
    "Guru": "Gurmukhi",
    "Hani": "Han",
    "Hang": "Hangul",
    "Rohg": "Hanifi Rohingya",
    "Hano": "Hanunoo",
    "Hatr": "Hatran",
    "Hebr": "Hebrew",
    "Hira": "Hiragana",
    "Armi": "Imperial Aramaic",
    "Zinh": "Inherited",
    "Qaai": "Inherited",    // Alias?
    "Phli": "Inscriptional Pahlavi",
    "Prti": "Inscriptional Parthian",
    "Java": "Javanese",
    "Kthi": "Kaithi",
    "Knda": "Kannada",
    "Kana": "Katakana",
    "Kali": "Kayah Li",
    "Khar": "Kharoshthi",
    "Khmr": "Khmer",
    "Khoj": "Khojki",
    "Sind": "Khudawadi",
    "Laoo": "Lao",
    "Latn": "Latin",
    "Lepc": "Lepcha",
    "Limb": "Limbu",
    "Lina": "Linear A",
    "Linb": "Linear B",
    "Lisu": "Lisu",
    "Lyci": "Lycian",
    "Lydi": "Lydian",
    "Mahj": "Mahajani",
    "Maka": "Makasar",
    "Mlym": "Malayalam",
    "Mand": "Mandaic",
    "Mani": "Manichaean",
    "Marc": "Marchen",
    "Gonm": "Masaram Gondi",
    "Medf": "Medefaidrin",
    "Mtei": "Meetei Mayek",
    "Mend": "Mende Kikakui",
    "Merc": "Meroitic Cursive",
    "Mero": "Meroitic Hieroglyphs",
    "Plrd": "Miao",
    "Modi": "Modi",
    "Mong": "Mongolian",
    "Mroo": "Mro",
    "Mult": "Multani",
    "Mymr": "Myanmar",
    "Nbat": "Nabataean",
    "Talu": "New Tai Lue",
    "Newa": "Newa",
    "Nkoo": "Nko",
    "Nshu": "Nushu",
    "Ogam": "Ogham",
    "Olck": "Ol Chiki",
    "Hung": "Old Hungarian",
    "Ital": "Old Italic",
    "Narb": "Old North Arabian",
    "Perm": "Old Permic",
    "Xpeo": "Old Persian",
    "Sogo": "Old Sogdian",
    "Sarb": "Old South Arabian",
    "Orkh": "Old Turkic",
    "Orya": "Oriya",
    "Osge": "Osage",
    "Osma": "Osmanya",
    "Hmng": "Pahawh Hmong",
    "Palm": "Palmyrene",
    "Pauc": "Pau Cin Hau",
    "Phag": "Phags-pa",
    "Phnx": "Phoenician",
    "Phlp": "Psalter Pahlavi",
    "Rjng": "Rejang",
    "Runr": "Runic",
    "Samr": "Samaritan",
    "Saur": "Saurashtra",
    "Shrd": "Sharada",
    "Shaw": "Shavian",
    "Sidd": "Siddham",
    "Sgnw": "SignWriting",
    "Sinh": "Sinhala",
    "Sogd": "Sogdian",
    "Sora": "Sora Sompeng",
    "Soyo": "Soyombo",
    "Sund": "Sundanese",
    "Sylo": "Syloti Nagri",
    "Syrc": "Syriac",
    "Tglg": "Tagalog",
    "Tagb": "Tagbanwa",
    "Tale": "Tai Le",
    "Lana": "Tai Tham",
    "Tavt": "Tai Viet",
    "Takr": "Takri",
    "Taml": "Tamil",
    "Tang": "Tangut",
    "Telu": "Telugu",
    "Thaa": "Thaana",
    "Thai": "Thai",
    "Tibt": "Tibetan",
    "Tfng": "Tifinagh",
    "Tirh": "Tirhuta",
    "Ugar": "Ugaritic",
    "Vaii": "Vai",
    "Wara": "Warang Citi",
    "Yiii": "Yi",
    "Zanb": "Zanabazar Square"
};
//
function uniHexify (string)
{
    return string.replace (/\b([0-9a-fA-F]{4,})\b/g, "U\+$&");
}
//
function characterToUtf32Code (character)
{
    let utf32Code = "";
    let num = character.codePointAt (0);
    let hex = num.toString (16).toUpperCase ();
    utf32Code = ("0000000" + hex).slice (-8);
    return utf32Code;
}
//
function characterToUtf16Code (character)
{
    let utf16Code = "";
    let num = character.codePointAt (0);
    if (num > 0xFFFF)
    {
        let highHex = character.charCodeAt (0).toString (16).toUpperCase ();
        let lowHex = character.charCodeAt (1).toString (16).toUpperCase ();
        highHex = ("000" + highHex).slice (-4);
        lowHex = ("000" + lowHex).slice (-4);
        utf16Code = `${highHex}\xA0${lowHex}`;
    }
    else
    {
        let hex = num.toString (16).toUpperCase ();
        hex = ("000" + hex).slice (-4);
        utf16Code = hex;
    }
    return utf16Code;
}
//
// https://kev.inburke.com/kevin/node-js-string-encoding/
function characterToUtf8 (character)
{
    let utf8 = [ ];
    let buffer = Buffer.from (character, 'utf8');
    for (let byte of buffer)
    {
        utf8.push (("00" + byte.toString (16).toUpperCase ()).slice (-2));
    }
    return utf8;
}
//
function characterToUtf8Code (character)
{
    return characterToUtf8 (character).join ('\xA0');
}
//
function characterToUrlEncoding (character)
{
    return characterToUtf8 (character).map (hex => `%${hex}`).join ("");
}
//
function characterToDecimalEntity (character)
{
    return `&#${character.codePointAt (0)};`;
}
//
function characterToJavaScriptEscape (character)
{
    let escape = "";
    let num = character.codePointAt (0);
    if (num > 0xFFFF)
    {
        let highHex = character.charCodeAt (0).toString (16).toUpperCase ();
        let lowHex = character.charCodeAt (1).toString (16).toUpperCase ();
        highHex = ("000" + highHex).slice (-4);
        lowHex = ("000" + lowHex).slice (-4);
        escape = `\\u${highHex}\\u${lowHex}`;
    }
    else
    {
        let hex = num.toString (16).toUpperCase ();
        hex = ("000" + hex).slice (-4);
        escape = `\\u${hex}`;
    }
    return escape;
}
//
function characterToEcmaScript6Escape (character)
{
    let num = character.codePointAt (0);
    let hex = num.toString (16).toUpperCase ();
    return `\\u{${hex}}`;
}
//
// https://en.wikibooks.org/wiki/Unicode/Versions
// https://www.unicode.org/history/publicationdates.html
const versionDate =
{
    "1.1": "June 1993",
    "2.0": "July 1996",
    "2.1": "May 1998",
    "3.0": "September 1999",
    "3.1": "March 2001",
    "3.2": "March 2002",
    "4.0": "April 2003",
    "4.1": "March 2005",
    "5.0": "July 2006",
    "5.1": "March 2008",
    "5.2": "October 2009",
    "6.0": "October 2010",
    "6.1": "January 2012",
    "6.2": "September 2012",
    "6.3": "September 2013",
    "7.0": "June 2014",
    "8.0": "June 2015",
    "9.0": "June 2016",
    "10.0": "June 2017",
    "11.0": "June 2018"
};
//
function getCharacterData (character)
{
    let characterData = { };
    characterData.utf32 = characterToUtf32Code (character);
    characterData.utf16 = characterToUtf16Code (character);
    characterData.utf8 = characterToUtf8Code (character);
    characterData.urlEncoding = characterToUrlEncoding (character);
    characterData.entity = characterToDecimalEntity (character)
    characterData.javaScript = characterToJavaScriptEscape (character);
    characterData.ecmaScript6 = characterToEcmaScript6Escape (character);
    let num = character.codePointAt (0);
    let hex = num.toString (16).toUpperCase ();
    if (hex.length < 5)
    {
        hex = ("000" + hex).slice (-4);
    }
    let codePoint = `U+${hex}`;
    characterData.character = character;
    characterData.codePoint = codePoint;
    for (let plane of planes)
    {
        if ((parseInt (plane.first, 16) <= num) && (num <= parseInt (plane.last, 16)))
        {
            characterData.planeName = plane.name;
            characterData.planeRange = uniHexify (plane.first + ".." + plane.last);
            break;
        }
    }
    for (let block of extraData.blocks)
    {
        if ((parseInt (block.first, 16) <= num) && (num <= parseInt (block.last, 16)))
        {
            characterData.blockName = block.name;
            characterData.blockRange = uniHexify (block.first + ".." + block.last);
            break;
        }
    }
    for (let version of extraData.versions)
    {
        if ((parseInt (version.first, 16) <= num) && (num <= parseInt (version.last, 16)))
        {
            characterData.age = `Unicode ${version.age}`;
            characterData.ageDate = versionDate[version.age];
            break;
        }
    }
    for (let script of extraData.scripts)
    {
        if ((parseInt (script.first, 16) <= num) && (num <= parseInt (script.last, 16)))
        {
            characterData.script = script.name.replace (/_/g, " ").replace ("Phags Pa", "Phags-pa");
            break;
        }
    }
    for (let scriptExtension of extraData.scriptExtensions)
    {
        if ((parseInt (scriptExtension.first, 16) <= num) && (num <= parseInt (scriptExtension.last, 16)))
        {
            let names = scriptExtension.aliases.split (" ").map (alias => scripts[alias]);
            characterData.scriptExtensions = names.join (", ");
            break;
        }
    }
    let binaryProperties = [ ];
    for (let binaryProperty of extraData.binaryProperties)
    {
        if ((parseInt (binaryProperty.first, 16) <= num) && (num <= parseInt (binaryProperty.last, 16)))
        {
            binaryProperties.push (binaryProperty.name.replace (/_/g, " "));
        }
    }
    if (binaryProperties.length > 0)
    {
        characterData.binaryProperties = binaryProperties.join (", ");
    }
    let coreProperties = [ ];
    for (let coreProperty of extraData.coreProperties)
    {
        if ((parseInt (coreProperty.first, 16) <= num) && (num <= parseInt (coreProperty.last, 16)))
        {
            coreProperties.push (coreProperty.name.replace (/_/g, " "));
        }
    }
    if (coreProperties.length > 0)
    {
        characterData.coreProperties = coreProperties.join (", ");
    }
    for (let ideograph of extraData.equivalentUnifiedIdeographs)
    {
        if ((parseInt (ideograph.first, 16) <= num) && (num <= parseInt (ideograph.last, 16)))
        {
            characterData.equivalentUnifiedIdeograph = uniHexify (ideograph.equivalent);
            break;
        }
    }
    let codePoints = unicodeData;
    if (codePoint in codePoints)
    {
        let data = codePoints[codePoint];
        characterData.name = data.name;
        characterData.category = categories[data.category];
        characterData.combining = combiningClasses[data.combining];
        characterData.bidi = bidiClasses[data.bidi];
        characterData.decomposition = uniHexify (data.decomposition);
        characterData.decimal = data.decimal;
        characterData.digit = data.digit;
        characterData.numeric = data.numeric;
        characterData.mirrored = mirrored[data.mirrored];
        characterData.alias = data.alias;
        characterData.comment = data.comment;
        characterData.uppercase = uniHexify (data.uppercase);
        characterData.lowercase = uniHexify (data.lowercase);
        characterData.titlecase = uniHexify (data.titlecase);
        characterData.correction = data.correction;
    }
    return characterData;
}
//
function getCharactersData (characters)
{
    let dataList = [ ];
    for (let character of characters)
    {
        dataList.push (getCharacterData (character));
    }
    return dataList;
}
//
function charactersToCodePoints (characters)
{
    let codePoints = [ ];
    for (let character of characters)
    {
        let num = character.codePointAt (0);
        let hex = num.toString (16).toUpperCase ();
        if (hex.length < 5)
        {
            hex = ("000" + hex).slice (-4);
        }
        codePoints.push (`U+${hex} `);
    }
    return codePoints.join ('');
}
//
function codePointsToCharacters (codePoints)
{
    let characters = "";
    codePoints = codePoints.replace (/\b([0-9a-fA-F]{4,})\b/g, "U+$1");
    const regex = /\\u([0-9a-fA-F]{4})|\\u\{([0-9a-fA-F]{1,})\}|U\+([0-9a-fA-F]{4,})/g;    // Global flag /g *must* be set!
    let hex;
    while ((hex = regex.exec (codePoints)))
    {
        let num = parseInt (hex[1] || hex[2] || hex[3], 16);
        if (num <= 0x10FFFF)
        {
            characters += String.fromCodePoint (num);
        }
    }
    return characters;
}
//
function findCharactersByData (regex, bySymbol)
{
    let characterList = [ ];
    let codePoints = unicodeData;
    for (let codePoint in codePoints)
    {
        if (bySymbol)
        {
            let character = String.fromCodePoint (parseInt (codePoints[codePoint].code, 16));
            if (regex.test (character))
            {
                characterList.push (character);
            }
        }
        else
        {
            if (codePoints[codePoint].name.match (regex) || codePoints[codePoint].alias.match (regex) || (codePoints[codePoint].correction && codePoints[codePoint].correction.match (regex)))
            {
                characterList.push (String.fromCodePoint (parseInt (codePoints[codePoint].code, 16)));
            }
        }
    }
    return characterList;
}
//
function getCharacterBasicData (character)
{
    let characterBasicData = { };
    let num = character.codePointAt (0);
    let hex = num.toString (16).toUpperCase ();
    if (hex.length < 5)
    {
        hex = ("000" + hex).slice (-4);
    }
    let codePoint = `U+${hex}`;
    characterBasicData.character = character;
    characterBasicData.codePoint = codePoint;
    let codePoints = unicodeData;
    if (codePoint in codePoints)
    {
        let data = codePoints[codePoint];
        characterBasicData.name = data.name;
        characterBasicData.alias = data.alias;
        characterBasicData.correction = data.correction;
    }
    for (let block of extraData.blocks)
    {
        if ((parseInt (block.first, 16) <= num) && (num <= parseInt (block.last, 16)))
        {
            characterBasicData.blockName = block.name;
            characterBasicData.blockRange = uniHexify (block.first + ".." + block.last);
            break;
        }
    }
    return characterBasicData;
}
//
module.exports =
{
    characterCount,
    getCharacterData,
    getCharactersData,
    charactersToCodePoints,
    codePointsToCharacters,
    findCharactersByData,
    getCharacterBasicData
};
//
