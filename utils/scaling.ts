import { PixelRatio } from "react-native";

const SCALE = 2.55 / PixelRatio.get();

export const n = (size: number) => size * SCALE;
