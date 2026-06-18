import { z } from "zod";

const optionalPhoneSchema = z.preprocess(
  (value) => (value === "" ? undefined : value),
  z
    .string()
    .trim()
    .regex(/^(0|\+84)[0-9]{9,10}$/, "So dien thoai khong hop le.")
    .optional(),
);

export const registerSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, "Ho ten phai co it nhat 2 ky tu.")
    .max(120, "Ho ten khong duoc vuot qua 120 ky tu."),
  email: z
    .string()
    .trim()
    .email("Email khong hop le.")
    .max(191, "Email khong duoc vuot qua 191 ky tu.")
    .toLowerCase(),
  phone: optionalPhoneSchema,
  password: z
    .string()
    .min(6, "Mat khau phai co it nhat 6 ky tu.")
    .max(72, "Mat khau khong duoc vuot qua 72 ky tu."),
});

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .email("Email khong hop le.")
    .max(191, "Email khong duoc vuot qua 191 ky tu.")
    .toLowerCase(),
  password: z.string().min(1, "Vui long nhap mat khau.").max(72),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
