import {
  View,
  Text,
  Linking,
  useColorScheme,
  Switch,
  Pressable,
} from "react-native";
import React, { useState } from "react";
import {
  DrawerContentComponentProps,
  DrawerContentScrollView,
  DrawerItem,
  DrawerItemList,
} from "@react-navigation/drawer";
import { BlurView } from "expo-blur";
import { Image } from "expo-image";
import HeaderDrawer from "./HeaderDrawer";
import ToggleSwitch from "toggle-switch-react-native";
import { useNavigation } from "@react-navigation/native";
import { MoonIcon, ProfileIconUnfocused } from "../../icons";
import { HomeNavigationProp } from "../../../types/navigation";
import useGetMode from "../../../hooks/GetMode";
import { useAppDispatch } from "../../../redux/hooks/hooks";
import { openSheet } from "../../../redux/slice/bottomSheet";
export default function CustomDrawerContent(
  props: DrawerContentComponentProps
) {
  const dark = useGetMode();
  const isDark = dark;
  const style = !isDark ? "light" : "dark";
  const backgroundColor = isDark ? "white" : "black";
  const color = isDark ? "white" : "black";
  const pressColor = isDark ? "#BEBEBE" : "#4F4F4F";
  const dispatch = useAppDispatch();
  const navigation = useNavigation<HomeNavigationProp>();
  return (
    <View style={{ flex: 1, padding: 20 }}>
      <BlurView
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,

          right: 0,
          top: 0,
        }}
        tint={style}
        intensity={200}
      />
      <DrawerContentScrollView {...props}>
        <HeaderDrawer />
        <View
          style={{
            height: 1,
            width: "100%",
            marginVertical: 20,
            backgroundColor,
          }}
        />
        <DrawerItemList {...props} />
        <DrawerItem
          label={({ focused }) => (
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",

                gap: 14,
              }}
            >
              <ProfileIconUnfocused size={25} color={color} />
              <Text
                style={{
                  color,
                  fontFamily: "jakaraBold",
                  includeFontPadding: false,
                  fontSize: 20,
                }}
              >
                Profile
              </Text>
            </View>
          )}
          onPress={() => {
            props.navigation.closeDrawer();
            navigation.navigate("Profile");
          }}
        />
      </DrawerContentScrollView>
      <View
        style={{
          marginBottom: 50,
          height: 40,
          width: 40,
          borderRadius: 999,
          overflow: "hidden",
        }}
      >
        <Pressable
          style={{
            height: 40,
            width: 40,
            borderRadius: 999,
            justifyContent: "center",
            alignItems: "center",
          }}
          onPress={() => {
            props.navigation.closeDrawer();
            dispatch(openSheet({ type: "modeSelect" }));
          }}
          android_ripple={{ color: pressColor, foreground: true }}
        >
          <MoonIcon size={25} color={color} />
        </Pressable>
      </View>
    </View>
  );
}