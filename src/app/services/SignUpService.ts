import axios from "axios";
import { z } from "zod";

import { SignUpSchema } from "app/utils/validate/SignUpSchema";
import { API } from "constants/api";

type SignUpFormValues = z.infer<typeof SignUpSchema>;

class SignUpService {
	async addUser(data: SignUpFormValues) {
		try {
			const response = await axios.post(API.SIGN_UP, data);

			return response.data;
		} catch (e) {
			throw e;
		}
	}
}

const signUpService = new SignUpService();

export default signUpService;
