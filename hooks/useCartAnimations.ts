import { useRef, useState, useEffect } from "react";
import { Animated } from "react-native";

export const useCartAnimations = (items: any[], scale: any) => {
  const animatedWidths = useRef(new Map<string, Animated.Value>()).current;
  const closeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [selectedItem, setSelectedItem] = useState<string | null>(null);  

  // Inicijalizacija animiranih vrijednosti za nove iteme
  useEffect(() => {
    items.forEach(item => {
      if (!animatedWidths.has(item.id)) {
        animatedWidths.set(item.id, new Animated.Value(scale.light(46)));
      }
    });
  }, [items]);


  useEffect(() => {
    items.forEach(item => {
      if (!animatedWidths.has(item.id)) {
        animatedWidths.set(item.id, new Animated.Value(scale.light(46))); // initial closed width
      }
    });
  }, [items]);

  const handleQuantityPress = (id: string) => {
    const isSameItem = selectedItem === id;
    setSelectedItem(isSameItem ? null : id);

    // Zatvaranje ostalih i otvaranje trenutnog
    items.forEach((item) => {
      const anim = animatedWidths.get(item.id);
      if (anim) {
        Animated.timing(anim, {
          toValue: (!isSameItem && item.id === id) ? scale.light(100) : scale.light(46),
          duration: 300,
          useNativeDriver: false,
        }).start();
      }
    });

    // Resetiranje tajmera za automatsko zatvaranje
    if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
    if (!isSameItem) {
      closeTimeoutRef.current = setTimeout(() => {
        const anim = animatedWidths.get(id);
        if (anim) {
          Animated.timing(anim, { toValue: scale.light(46), duration: 300, useNativeDriver: false }).start();
          setSelectedItem(null);
        }
      }, 3500);
    }
  };

  return { animatedWidths, handleQuantityPress, selectedItem };
};