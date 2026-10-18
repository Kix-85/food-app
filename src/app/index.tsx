import { StyleSheet, Text, View } from "react-native";
import "./globals.css";

export default function Index() {
  return (
    <View style={styles.container}>
      <Text className="text-xl font-bold text-cyan-500">Hello, World!</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
