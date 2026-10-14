import { defineAction } from 'astro:actions';
import { processFormSubmission } from '@axys/portal/forms';

export const server = {
  // Sem `input`: os campos vêm da definição do formulário no CMS e são validados pela API.
  submitForm: defineAction({
    accept: 'form',
    handler: (data, context) => processFormSubmission(data, context),
  }),
};
