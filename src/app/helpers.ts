
/**
 * Returns an array of hsla color strings
 * @param len Length of the array
 * @param saturation Saturation of the colors
 * @param lightness Lightness of the colors
 * @param alpha Alpha value of the colors
 */
export const chartColors = (len:number, saturation:number = 80, lightness:number = 50, alpha:number = 1) => {

  //calculate step
  let step = Math.floor(360/len);

  //return hsl color
  return new Array(len).fill('').map((x,i) =>(`hsla(${step*i}, ${saturation}%, ${lightness}%, ${alpha})`));

}

/**
 * Returns an array of random data that is between the given min and max values.
 * @param len Length of the array
 * @param min Minimum allowed value of the data
 * @param max Maximum allowed value of the data
 */
export const randomData = (len:number, min:number=0, max:number=100) => {

  let diff = max - min;

  return new Array(len).fill('').map(() => (Math.random()*diff+min));

}