import Joi from 'joi';

export const userValidate = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Invalid email format.',
    'any.required': 'Email is required.',
  }),
  password: Joi.string()
    .min(6)
    .pattern(new RegExp('(?=.*[A-Z])'))
    .required()
    .messages({
      'string.min': 'Password must be at least 6 characters long.',
      'string.pattern.base':
        'Password must contain at least one uppercase letter.',
    }),
});

export const categoryValidate = Joi.object({
  name: Joi.string().required().messages({
    'string.base': 'Category name must be a string',
    'string.empty': 'Category name cannot be empty',
    'any.required': 'Category name is required',
  }),
  description: Joi.string().required().allow('').messages({
    'string.base': 'Description must be a string',
    'string.empty': 'Description cannot be empty',
    'any.required': 'Description is required',
  }),
});

export const discountValidate = Joi.object({
  code: Joi.string().max(50).required(),
  percentage: Joi.number().min(0).max(100).required(),
  start_date: Joi.date().required(),
  end_date: Joi.date().min(Joi.ref('start_date')).required(),
});
