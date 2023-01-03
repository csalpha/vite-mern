// import
import bcrypt from "bcryptjs";

// data ( object )
const data = {
  // users - array of objects
  users: [
    {
      name: "Carlos",
      email: "carlos@mail.com",
      password: bcrypt.hashSync("1234", 8),
      isAdmin: true,
      isSeller: true,
      seller: {
        name: "Sony",
        logo: "/images/sony.png",
        description: "best seller",
        rating: 4.5,
        numReviews: 120,
      },
    },
    {
      name: "Ana",
      email: "ana@mail.com",
      password: bcrypt.hashSync("1234", 8),
      isAdmin: false,
      isSeller: true,
      seller: {
        name: "Microsoft",
        logo: "images/microsoft.png",
        description: "best seller",
        rating: 4.5,
        numReviews: 120,
      },
    },
    {
      name: "Joana",
      email: "joana@mail.com",
      password: bcrypt.hashSync("1234", 8),
      isAdmin: false,
      isSeller: true,
      seller: {
        name: "Nintendo",
        logo: "/images/nintendo.png",
        description: "best seller",
        rating: 4.5,
        numReviews: 120,
      },
    },
    {
      name: "Sofia",
      email: "sofia@mail.com",
      password: bcrypt.hashSync("1234", 8),
      isAdmin: false,
      isSeller: false,
    },
  ],

  // products - array of objects
  products: [
    {
      _id: 1,
      name: "PS5 Digital Edition",
      slug: "ps5-digital-edition",
      category: "Consoles",
      image: "/images/ps5-digital-edition.png",
      price: 399,
      countInStock: 50,
      brand: "Sony",
      rating: 4.9,
      numReviews: 10,
      description: "high quality product",
    },
    {
      _id: 2,
      name: "PS5 Standard Edition",
      slug: "ps5-standard-edition",
      category: "Consoles",
      image: "/images/ps5-standard-edition.png",
      price: 499,
      countInStock: 50,
      brand: "Sony",
      rating: 4.9,
      numReviews: 10,
      description: "high quality product",
    },
    {
      _id: 3,
      name: "Xbox Series X",
      slug: "xbox-series-x",
      category: "Consoles",
      image: "/images/xbox-series-x.png",
      price: 499,
      countInStock: 50,
      brand: "Microsoft",
      rating: 4.8,
      numReviews: 5,
      description: "high quality product",
    },
    {
      _id: 4,
      name: "Xbox Series S",
      slug: "xbox-series-s",
      category: "Consoles",
      image: "/images/xbox-series-s.png",
      price: 399,
      countInStock: 50,
      brand: "Microsoft",
      rating: 4.7,
      numReviews: 10,
      description: "high quality product",
    },
    {
      _id: 5,
      name: "Nintendo Switch",
      slug: "nintendo-switch",
      category: "Consoles",
      image: "/images/nintendo-switch.png",
      price: 299,
      countInStock: 50,
      brand: "Nintendo",
      rating: 4.8,
      numReviews: 5,
      description: "high quality product",
    },
  ],
};

// export
export default data;
