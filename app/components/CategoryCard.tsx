import React from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";

// Definiranje tipova za props
type CategoryCardProps = {
  item: {
    id: number;
    title: string;
    image: string;
  };
  onPress: (title: string) => void;
  styles: {
    card: object;
    image: object;
    text: object;
  };
};

// Komponenta s definiranim tipovima
export default function CategoryCard({ item, onPress, styles }: CategoryCardProps) {
  return (
    <TouchableOpacity style={styles.card} onPress={() => onPress(item.title)}>
      <Image source={{ uri: item.image }} style={styles.image} />
      <Text >{item.title}</Text>
    </TouchableOpacity>
  );
}
