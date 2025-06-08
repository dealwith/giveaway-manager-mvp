"use client";

import axios from "axios";
import useSWRMutation from "swr/mutation";
import { z } from "zod";

import { SignUpSchema } from "app/utils/validate/SignUpSchema";
import { API } from "constants/api";

type SignUpFormValues = z.infer<typeof SignUpSchema>;

const signUp = async (
	url: string,
	{ arg }: { arg: SignUpFormValues }
): Promise<{ success: boolean }> => {
	const response = await axios.post(url, arg);

	return response.data;
};

export const useSignUp = () => {
	const { trigger, data, error, isMutating } = useSWRMutation(
		API.SIGN_UP,
		signUp
	);

	return {
		signUp: trigger,
		isLoading: isMutating,
		isSuccess: Boolean(data?.success),
		isError: !!error,
		error
	};
};
