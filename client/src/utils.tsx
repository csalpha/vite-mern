export const getError = (error) => {
  return error.response && error.response.data.message
    ? error.response.data.message
    : error.message;
};
// define prices (array)
export const prices = [
  {
    name: "1 € to 50 €",
    value: "1-50",
  }, // [0]
  {
    name: "51 € to  200 €",
    value: "51-200",
  }, // [1]
  {
    name: "201 € to 1000 €",
    value: "201-1000",
  }, // [2]
];
// define ratings (array)
export const ratings = [
  {
    name: "4stars & up",
    rating: 4,
  }, // 0

  {
    name: "3stars & up",
    rating: 3,
  }, // [1]

  {
    name: "2stars & up",
    rating: 2,
  }, // [2]

  {
    name: "1stars & up",
    rating: 1, // [3]
  },
];
