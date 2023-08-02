import { View, Text } from 'react-native'
import React from 'react'
import { VerifiedIcon } from '../../../icons'

export default function NameAndTag({name,verified,userTag}:{name:string,verified:boolean,userTag:string}) {
  return (
    <View>
            <View
              style={{ flexDirection: "row", gap: 2, alignItems: "center" }}
            >
              <Text
                style={{
                  fontFamily: "jakaraBold",
                  includeFontPadding: false,
                  fontSize: 18,
                }}
              >
                {name}
              </Text>
              {verified && <VerifiedIcon color="green" size={20} />}
              <Text
                style={{
                  fontFamily: "jakara",
                  includeFontPadding: false,
                  color: "#7a868f",
                  fontSize: 18,
                  marginBottom: 2,
                }}
              >
                {userTag}
              </Text>
            </View>
          </View>
  )
}