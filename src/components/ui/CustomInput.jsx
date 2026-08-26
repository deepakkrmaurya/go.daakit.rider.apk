import { StyleSheet, TextInput, TouchableOpacity, View } from 'react-native'
import React from 'react'
import Icon from 'react-native-vector-icons/Feather'
import { RFValue } from 'react-native-responsive-fontsize'
import { Colors, Fonts } from '../../utils/Constants'

const CustomInput = ({ left, right, onClear, ...props }) => {
    return (
        <View style={styles.FlexRow}>

            {/* Left Icon */}
            <View style={styles.leftIcon}>
                {left}
            </View>

            {/* Input */}
            <TextInput
                {...props}
                style={styles.TextInput}
                placeholderTextColor="#ccc"
            />

            {/* Right Icon */}
            <View style={styles.icons}>
                {props.value?.length !== 0 && right && (
                    <TouchableOpacity onPress={onClear}>
                        <Icon
                            name="x-circle"
                            size={RFValue(16)}
                            color="#ccc"
                        />
                    </TouchableOpacity>
                )}
            </View>

        </View>
    )
}

export default CustomInput

const styles = StyleSheet.create({
    FlexRow: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 10,
        borderWidth: 0.5,
        width: '100%',
        marginVertical: 10,
        backgroundColor: '#fff',
        borderColor: Colors.border,
        shadowOffset: { width: 1, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
        shadowColor: Colors.border,
        elevation: 2,
    },

    leftIcon: {
        width: 45,
        alignItems: 'center',
        justifyContent: 'center',
    },

    TextInput: {
        flex: 1,
        fontFamily: Fonts.SemiBold,
        fontSize: RFValue(12),
        paddingVertical: 14,
        color: Colors.text,
    },

    icons: {
        width: 45,
        alignItems: 'center',
        justifyContent: 'center',
    },
})