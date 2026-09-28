import { z } from 'zod';

const iconSchema = z.object({ url: z.string() }).nullish();

const relationSchema = z.object({ data: z.object({ id: z.string() }) });

const fungibleInfoSchema = z.object({
  id: z.string().optional(),
  name: z.string().nullish(),
  symbol: z.string().nullish(),
  icon: iconSchema,
  flags: z.object({ verified: z.boolean().optional() }).nullish(),
});

const quantitySchema = z.object({ float: z.number() });

const changesSchema = z
  .object({
    absolute_1d: z.number().nullable(),
    percent_1d: z.number().nullable(),
  })
  .nullish();

export const portfolioResponseSchema = z.object({
  data: z.object({
    attributes: z.object({
      total: z.object({ positions: z.number() }),
      changes: changesSchema,
    }),
  }),
});

export const positionSchema = z.object({
  id: z.string(),
  attributes: z.object({
    quantity: quantitySchema,
    value: z.number().nullable(),
    price: z.number().nullish(),
    changes: changesSchema,
    fungible_info: fungibleInfoSchema,
    flags: z.object({ is_trash: z.boolean().optional() }).nullish(),
  }),
  relationships: z.object({
    chain: relationSchema,
    fungible: relationSchema,
  }),
});

export const listResponseSchema = z.object({
  data: z.array(z.unknown()),
  links: z.object({ next: z.string().nullish() }).nullish(),
});

const pointsSchema = z.array(z.tuple([z.number(), z.number()]));

export const walletChartResponseSchema = z.object({
  data: z.object({
    attributes: z.object({
      begin_at: z.string(),
      end_at: z.string(),
      points: pointsSchema,
    }),
  }),
});

export const fungibleChartResponseSchema = z.object({
  data: z.object({
    attributes: z.object({
      points: pointsSchema,
      stats: z.object({ first: z.number(), last: z.number() }).nullish(),
    }),
  }),
});

const transferSchema = z.object({
  direction: z.enum(['in', 'out', 'self']),
  fungible_info: fungibleInfoSchema.nullish(),
  nft_info: z.object({ name: z.string().nullish() }).nullish(),
  quantity: quantitySchema,
  value: z.number().nullish(),
  sender: z.string().nullish(),
  recipient: z.string().nullish(),
});

const approvalSchema = z.object({
  fungible_info: fungibleInfoSchema.nullish(),
  quantity: quantitySchema,
});

export const transactionSchema = z.object({
  id: z.string(),
  attributes: z.object({
    operation_type: z.string(),
    hash: z.string(),
    mined_at: z.string(),
    status: z.string(),
    sent_from: z.string().nullish(),
    sent_to: z.string().nullish(),
    fee: z.object({ value: z.number().nullish() }).nullish(),
    transfers: z.array(transferSchema).default([]),
    approvals: z.array(approvalSchema).default([]),
    application_metadata: z
      .object({
        name: z.string().nullish(),
        icon: iconSchema,
      })
      .nullish(),
  }),
  relationships: z.object({
    chain: relationSchema,
    dapp: relationSchema.nullish(),
  }),
});

export const chainSchema = z.object({
  id: z.string(),
  attributes: z.object({
    name: z.string(),
    icon: iconSchema,
  }),
});

export type ZerionPosition = z.infer<typeof positionSchema>;
export type ZerionTransaction = z.infer<typeof transactionSchema>;
export type ZerionChain = z.infer<typeof chainSchema>;
export type ZerionFungibleInfo = z.infer<typeof fungibleInfoSchema>;
