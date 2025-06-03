// filepath: f:/web/Twimbol/twimbol_app/types/react-native-hypertext.d.ts
declare module 'react-native-hypertext' {
    import { TextProps } from 'react-native';
    import React from 'react';
  
    interface HyperTextProps extends TextProps {
      children?: React.ReactNode;
    }
  
    const HyperText: React.FC<HyperTextProps>;
    export default HyperText;
  }