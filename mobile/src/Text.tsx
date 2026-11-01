import React,{createContext,useContext} from 'react';
import {StyleSheet,Text as RNText,TextInput as RNTextInput,type TextProps,type TextInputProps,type TextStyle} from 'react-native';
import {isLoaded} from 'expo-font';
import {useFonts,PlusJakartaSans_400Regular,PlusJakartaSans_500Medium,PlusJakartaSans_600SemiBold,PlusJakartaSans_700Bold,PlusJakartaSans_800ExtraBold} from '@expo-google-fonts/plus-jakarta-sans';

// DayStead's brand font, Plus Jakarta Sans, the same as the website.
// Custom fonts have one family per weight, and Android ignores fontWeight on them, so these
// wrappers turn the fontWeight in a style into the matching family. Use them instead of
// react-native's Text and TextInput; existing fontWeight styles keep working.
const FAMILY:Record<string,string>={'100':'PlusJakartaSans_400Regular','200':'PlusJakartaSans_400Regular','300':'PlusJakartaSans_400Regular','400':'PlusJakartaSans_400Regular',normal:'PlusJakartaSans_400Regular','500':'PlusJakartaSans_500Medium','600':'PlusJakartaSans_600SemiBold','700':'PlusJakartaSans_700Bold',bold:'PlusJakartaSans_700Bold','800':'PlusJakartaSans_800ExtraBold','900':'PlusJakartaSans_800ExtraBold'};

// Loads the font files. Until they load (or if loading fails) text uses the phone's own font.
export function useBrandFont(){
 const [loaded,error]=useFonts({PlusJakartaSans_400Regular,PlusJakartaSans_500Medium,PlusJakartaSans_600SemiBold,PlusJakartaSans_700Bold,PlusJakartaSans_800ExtraBold});
 return loaded||!!error;
}

// Text inside Text inherits its parent's weight unless it sets its own.
const Inherited=createContext<string|null>(null);

function family(style:TextProps['style'],parent:string|null){
 if(!isLoaded(FAMILY['400']))return null;
 const flat=(StyleSheet.flatten(style)||{}) as TextStyle;
 if(flat.fontFamily)return null;
 return flat.fontWeight?FAMILY[String(flat.fontWeight)]||FAMILY['400']:parent||FAMILY['400'];
}

export function Text(props:TextProps){
 const fam=family(props.style,useContext(Inherited));
 if(!fam)return <RNText {...props}/>;
 return <Inherited.Provider value={fam}><RNText {...props} style={[props.style,{fontFamily:fam,fontWeight:'normal'}]}/></Inherited.Provider>;
}
export function TextInput(props:TextInputProps){
 const fam=family(props.style,null);
 return <RNTextInput {...props} style={fam?[props.style,{fontFamily:fam,fontWeight:'normal'}]:props.style}/>;
}
