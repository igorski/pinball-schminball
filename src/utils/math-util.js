const ONE_EIGHTY_OVER_PI = 180 / Math.PI;
const PI_OVER_ONE_EIGHTY = Math.PI / 180;

export const radToDeg = radians => radians * ONE_EIGHTY_OVER_PI;
export const degToRad = degrees => degrees * PI_OVER_ONE_EIGHTY;
