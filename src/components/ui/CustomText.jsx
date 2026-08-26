import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { RFValue } from 'react-native-responsive-fontsize'
import { Colors, Fonts } from '../../utils/Constants';
const CustomText = ({
    varient = 'body',
    fontFamily = Fonts.Regular,
    fontSize,
    style,
    children,
    numberOfLines,     
    onLayout,
    ...props
}) => {

    let computedFontSize;
    switch (varient) {
        case 'h1':
            computedFontSize = RFValue(fontSize || 22);
            break;
        case 'h2':
            computedFontSize = RFValue(fontSize || 20);
            break;
        case 'h3':
            computedFontSize = RFValue(fontSize || 18);
            break;
        case 'h4':
            computedFontSize = RFValue(fontSize || 16);
            break;
        case 'h5':
            computedFontSize = RFValue(fontSize || 14);
            break;
        case 'h6':
            computedFontSize = RFValue(fontSize || 12);
            break;
        case 'h7':
            computedFontSize = RFValue(fontSize || 10);
            break;
        case 'h8':
            computedFontSize = RFValue(fontSize || 9);
            break;
        case 'h9':
            computedFontSize = RFValue(fontSize || 12);
            break;
        case 'body':
            computedFontSize = RFValue(fontSize || 12);
            break;


    }


    const fontFamilyStyle = {
        fontFamily: fontFamily,
    };

    return (

        <Text
            onLayout={onLayout}
            style={[
                styles.text,
                {color:Colors.text, fontSize: computedFontSize,fontFamily:fontFamily},
                fontFamilyStyle,
                style
            ]}
            numberOfLines={numberOfLines!=undefined? numberOfLines : undefined}
            {...props}
            
            >
            {children}
        </Text>

    )
}

export default CustomText

const styles = StyleSheet.create({
    text: {
        textAlign: 'left',
    }
})