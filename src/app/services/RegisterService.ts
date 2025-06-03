import axios from "axios";
import { SignUpSchema } from "@/utils/validate/SignUpSchema";
import { API } from "@constants/api";
import { z } from "zod";

type SignUpFormValues = z.infer<typeof SignUpSchema>;

class RegisterService {
  async addUser(data: SignUpFormValues) {
    try {
      const response = await axios.post(API.REGISTER, data);

      return response.data;
    } catch (e) {
      throw e;
    }
  }
}

const registerService = new RegisterService();

export default registerService;
