import cs50xIcon from "../../../png/cs50x-icon.png";

/**
 * CS50x award card content for the /awards dimension.
 * @module screens/awards/cs50x
 */

/** @type {{ name: string, description: string, issuer: string, year: string, url: string, icon: import("react-native").ImageSourcePropType }} */
const cs50x = {
  name: "CS50x",
  description: "Harvard University's introduction to the intellectual enterprises of computer science and the art of programming — ten problem sets, nine labs, and one final project.",
  issuer: "Harvard University",
  year: "October 2023",
  url: "https://cs50.harvard.edu/certificates/09fecdac-ae64-42eb-8274-0cc99808d52e",
  icon: cs50xIcon
};

export default cs50x;
