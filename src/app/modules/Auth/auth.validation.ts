// import { z } from "zod";


// const loginValidationSchema = z.object({
//     body: z.object({
//       name: z.string({ required_error: 'User name is required' }),
//       password: z.string({ required_error: 'Password is required ' }),
//     }),
//   });

//   const changePasswordValidationSchema = z.object({
//     body: z.object({
//       oldPassword: z.string({ required_error: 'Old password is required' }),
//       newPassword: z.string({ required_error: ' Password is required ' }),
//     }),
//   });

//   const forgetPasswordValidationSchema = z.object({
//     body:z.object({
//       id:z.string({
//         required_error:"User id is required"
//       })
//     })
//   })

//   const resetPasswordValidationSchema = z.object({
//     body: z.object({
//       id:z.string({required_error:'User id is requried'}),
//       newPassword:z.string({required_error:'User password is requried'})
//     })
//   })


//   export const AuthValidation = {
//     loginValidationSchema,
//     changePasswordValidationSchema,
//     forgetPasswordValidationSchema,
//     resetPasswordValidationSchema
//   }


import { z } from "zod";

const loginValidationSchema = z.object({
  body: z.object({
    name: z.string({ required_error: 'User name is required' }),
    password: z.string({ required_error: 'Password is required ' }),
  }),
});

const refreshTokenValidationSchema = z.object({
  body: z.object({
    refreshToken: z.string({ required_error: 'Refresh token is required' }),
  }),
});

const changePasswordValidationSchema = z.object({
  body: z.object({
    oldPassword: z.string({ required_error: 'Old password is required' }),
    newPassword: z.string({ required_error: 'Password is required ' }),
  }),
});

const forgetPasswordValidationSchema = z.object({
  body: z.object({
    id: z.string({
      required_error: "User id is required"
    })
  })
});

const resetPasswordValidationSchema = z.object({
  body: z.object({
    id: z.string({ required_error: 'User id is required' }),
    newPassword: z.string({ required_error: 'User password is required' })
  })
});

export const AuthValidation = {
  loginValidationSchema,
  refreshTokenValidationSchema, // Add this
  changePasswordValidationSchema,
  forgetPasswordValidationSchema,
  resetPasswordValidationSchema
};