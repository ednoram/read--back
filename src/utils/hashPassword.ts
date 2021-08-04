import { hash, genSalt } from "bcrypt";

const generateSalt = async (rounds: number) => await genSalt(rounds);

const hashPassword = async (password: string): Promise<string> => {
  const salt = await generateSalt(10);
  const hashedPassword = await hash(password, salt);
  return hashedPassword;
};

export default hashPassword;
