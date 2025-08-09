import { StyleSheet, Text, View, TouchableOpacity, Platform, FlexAlignType  } from 'react-native'

import React, { useState } from 'react';
import DateTimePicker from '@react-native-community/datetimepicker';
import { MaterialCommunityIcons } from '@expo/vector-icons';



export const formatDate = (date) => {
    if (!date) return '';
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    const selectedDate = `${year}-${month}-${day}`
    return selectedDate;
  };


export const DatePickerInput = ({ 
  birthday, 
  setBirthday, 
  isBirthdayFocused, 
  setIsBirthdayFocused, 
  styles, 
  loading,
  passwordInputRef 
}:FlexAlignType) => {
  const [showDatePicker, setShowDatePicker] = useState(false);

  

  const handleDateChange = (event, selectedDate) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
      setIsBirthdayFocused(false);
    }
    
    if (selectedDate) {
      setBirthday(selectedDate);
      
      // Focus next input after date selection
      setTimeout(() => {
        if (passwordInputRef?.current) {
          passwordInputRef.current.focus();
        }
        if (Platform.OS === 'ios') {
          setIsBirthdayFocused(false);
        }
      }, Platform.OS === 'ios' ? 200 : 100);
    }
  };

  const openDatePicker = () => {
    if (!loading) {
      setIsBirthdayFocused(true);
      setShowDatePicker(true);
    }
  };

  const closeDatePicker = () => {
    setShowDatePicker(false);
    setIsBirthdayFocused(false);
  };

  return (
    <View style={[styles.inputContainer, isBirthdayFocused && styles.inputContainerFocused]}>
      <MaterialCommunityIcons
        name="calendar"
        size={22}
        color={isBirthdayFocused ? '#FF7751' : '#888'}
        style={styles.inputIcon}
      />
      <TouchableOpacity
        style={[styles.input, additionalStyles.datePickerTouchable]}
        onPress={openDatePicker}
        disabled={loading}
        activeOpacity={0.7}
      >
        <Text style={[
          additionalStyles.datePickerText,
          ...(!birthday ? [additionalStyles.placeholderText] : [])
        ]}>
          {birthday ? formatDate(birthday) : 'Birth Date'}
        </Text>
      </TouchableOpacity>

      {showDatePicker && (
        <DateTimePicker
          value={birthday || new Date()}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleDateChange}
          maximumDate={new Date()}
          minimumDate={new Date(1900, 0, 1)} 
          {...(Platform.OS === 'ios' && {
            onTouchCancel: closeDatePicker,
          })}
        />
      )}
    </View>
  );
};

// Additional styles you'll need to add to your StyleSheet
const additionalStyles = {
  datePickerTouchable: {
    justifyContent: 'center',
    flex: 1,
    paddingLeft: 5,
  },
  datePickerText: {
    fontSize: 16,
    color: '#000', 
  },
  placeholderText: {
    color: '#999',
  },
};





const TimeAgo = ({time_string}:any) => {
    
    const yourDate = new Date(time_string);
    const now = new Date();
    
    const diffMs = now - yourDate; 
    const diffMins = Math.floor(diffMs / 60000); 
    
    let timeAgo = "";
    
    if (diffMins < 1) {
      timeAgo = "Just now";
    } else if (diffMins < 60) {
      timeAgo = `${diffMins} minutes ago`;
    } else if (diffMins < 1440) {
      const hours = Math.floor(diffMins / 60);
      timeAgo = `${hours} hours ago`;
    } else {
      const days = Math.floor(diffMins / 1440);
      timeAgo = `${days} days ago`;
    }
    
  
    return (
      <Text>{timeAgo}</Text>
  )
}

export default TimeAgo

const styles = StyleSheet.create({})






