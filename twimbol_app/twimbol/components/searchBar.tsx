import { StyleSheet, Text, View, Image, TextInput, Keyboard } from 'react-native'
import React, { useRef, useCallback, useMemo } from 'react'

import { icons } from '@/constants/icons'
import { useRouter } from "expo-router";

import { TouchableOpacity } from 'react-native-gesture-handler';
import { useNavigation } from '@react-navigation/native';

interface SearchBarProps {
  placeholder?: string;
  value: string;
  onChangeText: (text: string) => void;
  onSearchPress?: () => void;
  autoFocus?: boolean;
  editable?: boolean;
  maxLength?: number;
  onFocus?: () => void;
  onBlur?: () => void;
  style?: object;
  showClearButton?: boolean;
  loading?: boolean;
  debounceMs?: number;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  secureTextEntry?: boolean;
  multiline?: boolean;
  numberOfLines?: number;
  testID?: string;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  theme?: 'light' | 'dark';
  size?: 'small' | 'medium' | 'large';
  variant?: 'default' | 'minimal' | 'bordered';
}

const SearchBar = ({
  placeholder = "Search...",
  value,
  onChangeText,
  onSearchPress,
  autoFocus = false,
  editable = true,
  maxLength,
  onFocus,
  onBlur,
  style,
  showClearButton = true,
  loading = false,
  debounceMs = 0,
  keyboardType = 'default',
  autoCapitalize = 'none',
  secureTextEntry = false,
  multiline = false,
  numberOfLines = 1,
  testID,
  accessibilityLabel,
  accessibilityHint,
  theme = 'light',
  size = 'medium',
  variant = 'default'
}: SearchBarProps) => {
  const navigation = useNavigation();
  const inputRef = useRef<TextInput>(null);
  const debounceTimeout = useRef<NodeJS.Timeout | null>(null);

  // Memoized style calculations
  const containerStyles = useMemo(() => {
    const baseStyle = styles.container;
    const themeStyle = theme === 'dark' ? styles.containerDark : {};
    const sizeStyle = styles[`container${size.charAt(0).toUpperCase() + size.slice(1)}` as keyof typeof styles] || {};
    return [baseStyle, themeStyle, sizeStyle, style];
  }, [theme, size, style]);

  const searchBarStyles = useMemo(() => {
    const baseStyle = styles.searchBar;
    const variantStyle = styles[`searchBar${variant.charAt(0).toUpperCase() + variant.slice(1)}` as keyof typeof styles] || {};
    const themeStyle = theme === 'dark' ? styles.searchBarDark : {};
    return [baseStyle, variantStyle, themeStyle];
  }, [variant, theme]);

  // Debounced text change handler
  const handleTextChange = useCallback((text: string) => {
    if (debounceMs > 0) {
      if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current);
      }
      debounceTimeout.current = setTimeout(() => {
        onChangeText(text);
      }, debounceMs);
    } else {
      onChangeText(text);
    }
  }, [onChangeText, debounceMs]);

  const handleSearchPress = useCallback(() => {
    Keyboard.dismiss();
    if (onSearchPress) {
      onSearchPress();
    }
  }, [onSearchPress]);

  const handleClearPress = useCallback(() => {
    onChangeText('');
    inputRef.current?.focus();
  }, [onChangeText]);

  const focusInput = useCallback(() => {
    inputRef.current?.focus();
  }, []);

  const handleFocus = useCallback(() => {
    if (onFocus) {
      onFocus();
    }
  }, [onFocus]);

  const handleBlur = useCallback(() => {
    if (onBlur) {
      onBlur();
    }
  }, [onBlur]);

  // Cleanup debounce timeout on unmount
  React.useEffect(() => {
    return () => {
      if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current);
      }
    };
  }, []);

  const inputHeight = size === 'small' ? 40 : size === 'large' ? 56 : 48;
  const iconSize = size === 'small' ? 18 : size === 'large' ? 22 : 20;

  return (
    <View style={containerStyles} testID={testID}>
      <View style={searchBarStyles}>
        {/* Search Icon at the beginning */}
        {/* <View style={styles.searchIconContainer}>
          <Image
            source={icons.search}
            style={[
              styles.searchIcon,
              { width: iconSize, height: iconSize },
              theme === 'dark' && styles.searchIconDark
            ]}
          />
        </View> */}

        <TouchableOpacity 
          style={styles.inputContainer}
          onPress={focusInput}
          activeOpacity={1}
          accessible={false}
        >
          <TextInput 
            ref={inputRef}
            autoFocus={autoFocus}
            style={[
              styles.searchInput, 
              { height: inputHeight },
              theme === 'dark' && styles.searchInputDark
            ]}
            placeholder={placeholder}
            placeholderTextColor={theme === 'dark' ? '#9CA3AF' : '#6B7280'}
            value={value}
            onChangeText={debounceMs > 0 ? handleTextChange : onChangeText}
            onFocus={handleFocus}
            onBlur={handleBlur}
            editable={editable && !loading}
            maxLength={maxLength}
            returnKeyType="search"
            onSubmitEditing={handleSearchPress}
            blurOnSubmit={false}
            keyboardType={keyboardType}
            autoCapitalize={autoCapitalize}
            secureTextEntry={secureTextEntry}
            multiline={multiline}
            numberOfLines={numberOfLines}
            accessibilityLabel={accessibilityLabel || placeholder}
            accessibilityHint={accessibilityHint || "Enter search text"}
            testID={testID ? `${testID}-input` : undefined}
          />
        </TouchableOpacity>
        
        {/* Loading indicator or Clear button */}
        {loading ? (
          <View style={styles.actionContainer}>
            <View style={styles.loadingSpinner}>
              <Text style={[styles.loadingText, theme === 'dark' && styles.loadingTextDark]}>
                ⋯
              </Text>
            </View>
          </View>
        ) : (
          <View style={styles.actionContainer}>
            {/* Clear button */}
            {showClearButton && value.length > 0 && (
              <TouchableOpacity 
                onPress={handleClearPress}
                style={styles.clearButton}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                accessibilityLabel="Clear search"
                accessibilityRole="button"
                testID={testID ? `${testID}-clear` : undefined}
              >
                <Text style={[
                  styles.clearButtonText,
                  theme === 'dark' && styles.clearButtonTextDark
                ]}>×</Text>
              </TouchableOpacity>
            )}
            
            {/* Search button */}
            <TouchableOpacity 
              style={[
                styles.searchButton,
                theme === 'dark' && styles.searchButtonDark,
                loading && styles.searchButtonDisabled
              ]}
              onPress={handleSearchPress}
              activeOpacity={0.8}
              disabled={loading}
              accessibilityLabel="Search"
              accessibilityRole="button"
              testID={testID ? `${testID}-search` : undefined}
            >
              <Image
                source={icons.search}
                style={[
                  styles.searchButtonIcon,
                  { width: iconSize, height: iconSize },
                  theme === 'dark' && styles.searchButtonIconDark
                ]}
              />
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  containerSmall: {
    marginTop: 15,
  },
  containerMedium: {
    marginTop: 30,
  },
  containerLarge: {
    marginTop: 45,
  },
  containerDark: {
    backgroundColor: 'transparent',
  },
  searchBar: {
    width: '100%',
    maxWidth: 400,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 50,
    paddingHorizontal: 16,
    paddingVertical: 4,
    // Modern shadow for iOS
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    // Android elevation
    elevation: 4,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  searchBarDark: {
    backgroundColor: '#1F2937',
    borderColor: '#374151',
    shadowColor: '#000',
    shadowOpacity: 0.25,
  },
  searchBarMinimal: {
    backgroundColor: 'transparent',
    elevation: 0,
    shadowOpacity: 0,
    borderBottomWidth: 2,
    borderBottomColor: '#E5E7EB',
    borderRadius: 0,
    borderWidth: 0,
  },
  searchBarBordered: {
    borderWidth: 2,
    borderColor: '#D1D5DB',
  },
  searchIconContainer: {
    paddingRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchIcon: {
    tintColor: '#6B7280',
  },
  searchIconDark: {
    tintColor: '#9CA3AF',
  },
  inputContainer: {
    flex: 1,
  },
  searchInput: {
    fontSize: 16,
    color: '#111827',
    fontWeight: '400',
    lineHeight: 20,
    paddingVertical: 0,
  },
  searchInputDark: {
    color: '#F9FAFB',
  },
  actionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 8,
  },
  loadingSpinner: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  loadingText: {
    fontSize: 18,
    color: '#6B7280',
    fontWeight: '600',
  },
  loadingTextDark: {
    color: '#9CA3AF',
  },
  clearButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  clearButtonText: {
    fontSize: 18,
    color: '#6B7280',
    fontWeight: '600',
    lineHeight: 18,
  },
  clearButtonTextDark: {
    color: '#9CA3AF',
  },
  searchButton: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#FF6E42',
    alignItems: 'center',
    justifyContent: 'center',
    // Button shadow
    shadowColor: '#3B82F6',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  searchButtonDark: {
    backgroundColor: '#FF6E42',
    shadowColor: '#2563EB',
  },
  searchButtonDisabled: {
    backgroundColor: '#D1D5DB',
    shadowOpacity: 0.1,
  },
  searchButtonIcon: {
    tintColor: '#FFFFFF',
  },
  searchButtonIconDark: {
    tintColor: '#FFFFFF',
  },
});

export default SearchBar;