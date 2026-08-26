import { ActivityIndicator, StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { TouchableOpacity } from 'react-native'
import { Colors, Fonts } from '../../utils/Constants'
import CustomText from '../../components/ui/CustomText'
import { RFValue } from 'react-native-responsive-fontsize'
const CustomButten = ({ onPress, loding, title, disabled }) => {
    return (
        <TouchableOpacity
            onPress={onPress}
            disabled={disabled}
            activeOpacity={0.8}
            style={[styles.btn, {
                backgroundColor: disabled ? Colors.disabled : Colors.primary
            }]}
        >
            {
                loding
                    ? <ActivityIndicator color="#fff" size="small" />
                    : <CustomText
                        style={styles.text}
                        variant='h4'
                        fontSize={RFValue(12)}
                        fontFamily={Fonts.SemiBold}
                        
                        >
                        {title}
                    </CustomText>
            }
        </TouchableOpacity>
    )
}

export default CustomButten

const styles = StyleSheet.create({
btn:{
    width:"100%",
    justifyContent:'center',
    alignItems:'center',
    paddingHorizontal:10,
    paddingVertical:10,
    borderRadius:5
},
text:{
    color:"#fff"
}

})