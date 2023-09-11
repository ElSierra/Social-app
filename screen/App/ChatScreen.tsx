import { View, Text, Pressable, FlatList } from "react-native";
import React, {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import AnimatedScreen from "../../components/global/AnimatedScreen";
import { ChatScreenProp } from "../../types/navigation";
import FastImage from "react-native-fast-image";

import { Entypo } from "@expo/vector-icons";
import ChatBox from "../../components/chat/ChatBox";
import { dummyChat } from "../../data/dummyChat";
import ChatBuilderText from "../../components/chat/ChatBuilderText";
import { useAppDispatch, useAppSelector } from "../../redux/hooks/hooks";
import useGetMode from "../../hooks/GetMode";

import { addNewChat, addToChatList } from "../../redux/slice/chat/chatlist";
import uuid from "react-native-uuid";
import TypingBox from "../../components/chat/TypingBox";
import BSON from "bson";
import ContextMenu from "react-native-context-menu-view";
import { HoldItem, HoldMenuProvider } from "react-native-hold-menu";
import { IChatList } from "../../types/api";
import { findChatById } from "../../util/chatSearch";
import socket from "../../util/socket";
import Animated from "react-native-reanimated";
import { ChatModal } from "../../components/messages/ChatList/ChatModal";
import { Portal } from "react-native-paper";
import { useNavigation, useNavigationState } from "@react-navigation/native";
import { openToast } from "../../redux/slice/toast/toast";
import { useUploadPhotoMutation } from "../../redux/api/services";

export default function ChatScreen({ navigation, route }: ChatScreenProp) {
  const user = useAppSelector((state) => state.user?.data);
  const chatState = useAppSelector((state) => state?.chatlist.data);
  const state = useNavigationState((state) => state);
  const dispatch = useAppDispatch();
  console.log("👺");
  const onlineIds = useAppSelector((state) => state.online.ids);
  const isOnline = onlineIds?.some((ids) => ids === route.params.receiverId);

  const [userChats, setChats] = useState<IChatList | undefined>(undefined);
  const dark = useGetMode();
  const color = dark ? "#FFFFFF" : "#000000";
  const [messageText, setMessageText] = useState("");
  const [sentSuccess, setSentSuccess] = useState(true);

  const [isTyping, setIstyping] = useState(false);
  console.log(
    "🚀 ~ file: ChatScreen.tsx:29 ~ ChatScreen ~ isTyping:",
    isTyping
  );

  useMemo(() => {
    findChatById(route.params.id, chatState)
      .then((chat) => {
        if (chat) {
          setChats(chat);
        } else {
          console.log("Chat not found");
        }
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  }, [chatState]);

  useEffect(() => {
    socket.on("sent", (sent) => {
      setSentSuccess(sent);
    });
  }, [socket]);
  useLayoutEffect(() => {
    socket?.emit("chat", route.params.id);
  }, []);
  useMemo(() => {
    socket?.emit(
      "isTyping",
      route.params.id,
      messageText.length > 0 ? true : false
    );
  }, [messageText]);

  useMemo(() => {
    socket?.on("isTyping", (data: { isTyping: boolean; id: string }) => {
      console.log("🚀 ~ file: ChatScreen.tsx:91 ~ socket?.on ~ data:", data);
      if (data) {
        if (data.id !== user?.id) {
          setIstyping(data.isTyping);
        }
      }
    });
  }, [socket]);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: () => {
        return (
          <View
            style={{
              flexDirection: "row",
              justifyContent: "center",
              alignItems: "center",
              gap: 4,
            }}
          >
            <Text
              style={{
                color,
                fontFamily: "jakaraBold",
                includeFontPadding: false,

                justifyContent: "center",
                paddingBottom: 4,
              }}
            >
              @{route.params.name}
            </Text>
            <Animated.View
              key={isOnline ? `online` : `offline`}
              style={{
                width: 10,
                height: 10,
                backgroundColor: isOnline ? "green" : "red",
                borderRadius: 9999,
              }}
            />
          </View>
        );
      },
      headerTitleStyle: { fontFamily: "jakaraBold", color },
      headerBackVisible: false,
      headerLeft: () => {
        return (
          <Pressable
            onPress={() => {
              navigation.goBack();
            }}
          >
            <View
              style={{
                marginRight: 10,
                flexDirection: "row",
                alignItems: "center",
              }}
            >
              <Entypo name="chevron-left" size={30} color={color} />
              <FastImage
                style={{ height: 40, width: 40, borderRadius: 9999 }}
                source={{
                  uri: route.params.imageUri,
                }}
              />
            </View>
          </Pressable>
        );
      },
    });
  }, [color, isOnline]);

  const handleSendMessage = () => {
    setSentSuccess(false);
    const id = new BSON.ObjectId();

    dispatch(
      addNewChat({
        message: {
          sender: { userName: user?.userName || "", id: user?.id as string },
          text: messageText,
          id: uuid.v4().toString(),
          createdAt: `${new Date()}`,
        },
        chatId: route?.params?.id as string,
      })
    );

    setMessageText("");
    socket?.emit("newMessage", {
      message: {
        sender: { userName: user?.userName || "", id: user?.id as string },
        text: messageText,
        id,
        createdAt: `${new Date()}`,
      },
      imageUri: route.params.imageUri,
      chatId: route?.params?.id as string,
    });

    setTimeout(() => {
      if (!sentSuccess) {
        dispatch(openToast({ text: "Message didnot Send", type: "Failed" }));
      }
    }, 10000);
  };
  const [isOpen, setIsOpen] = useState(false);

  const [visibleId, setVisibleId] = useState<string | null>(null);
  const closeModal = () => {
    setIsOpen(false);
    setVisibleId(null);
  };

  const [text, setText] = useState({
    id: "",
    text: "",
    x: 0,
    y: 0,
    width: 0,
    sent: false,
    height: 0,
    pageX: 0,
    pageY: 0,
  });
  const buttonRef = useRef<View>(null);
  const measureItemPosition = (
    id: string,
    text: string,
    sent: boolean,
    isMe: boolean
  ) => {
    buttonRef?.current?.measure((x, y, width, height, pageX, pageY) => {
      setText({ id, text, sent, x, y, width, height, pageX, pageY });
      if (isMe) setIsOpen(true);
    });
  };
  const [photo] = useUploadPhotoMutation();

  function handleSetPhotoPost(mimeType: string, uri: string, size: number) {
    photo({ mimeType, uri }).then((e)=>{
      console.log(e)
    }).catch((e)=>{
      console.log(e)
    })
  }

  return (
    <>
      <ChatModal
        isOpen={isOpen}
        closeModal={closeModal}
        text={text}
        chatId={route.params.id}
      />
      <View style={{ flex: 1 }}>
        <View style={{ flex: 1 }}>
          <FlatList
            inverted
            ListHeaderComponent={() => {
              return (
                <View
                  style={{
                    height: 90,
                    justifyContent: "flex-start",
                    alignItems: "center",
                  }}
                >
                  {isTyping && messageText.length < 1 && <TypingBox />}
                </View>
              );
            }}
            data={userChats?.messages}
            contentContainerStyle={{ gap: 15, padding: 20, paddingBottom: 100 }}
            renderItem={({ item }) => (
              <Pressable
                ref={buttonRef}
                onLongPress={(e) => {
                  measureItemPosition(
                    item.id,
                    item.text,
                    userChats?.messages[0]?.id === item?.id &&
                      userChats?.messages[0]?.sender?.id === user?.id &&
                      sentSuccess,
                    item?.sender?.id === user?.id
                  );
                  setVisibleId(item.id);
                }}
              >
                {
                  <ChatBuilderText
                    id={item.id}
                    isClicked={visibleId}
                    isMe={item?.sender?.id === user?.id}
                    text={item?.text}
                    time={item?.createdAt}
                    sent={
                      userChats?.messages[0]?.id === item?.id &&
                      userChats?.messages[0]?.sender?.id === user?.id &&
                      sentSuccess
                    }
                  />
                }
              </Pressable>
            )}
          />
        </View>
        <View
          style={{
            padding: 10,
            paddingBottom: 20,
            position: "absolute",
            bottom: 0,
            alignItems: "center",
            justifyContent: "center",
            width: "100%",
          }}
        >
          <ChatBox
            handleSetPhotoPost={handleSetPhotoPost}
            props={{
              value: messageText,
              onChangeText: (text) => {
                setMessageText(text);
              },
              onFocus: (e) => {
                console.log("focused");
              },
              onBlur: (e) => {
                console.log("unfocused");
              },
            }}
            onPress={handleSendMessage}
          />
        </View>
      </View>
    </>
  );
}
