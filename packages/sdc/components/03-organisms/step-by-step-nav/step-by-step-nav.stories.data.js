/**
 * CivicTheme Step by Step Nav component stories data.
 */

function numberedSteps(steps) {
  let num = 0;
  return steps.map(function (step) {
    return Object.assign({}, step, { number: step.logic ? null : ++num });
  });
}

const grantSteps = [
  {
    title: 'Check your eligibility',
    contents: [
      {
        type: 'paragraph',
        text: 'Community services grants are open to incorporated not-for-profit organisations operating in the local government area.',
      },
      {
        type: 'paragraph',
        text: 'Your organisation must have held an active ABN for at least 12 months before the closing date and must not have any outstanding acquittals from previous grants.',
      },
    ],
  },
  {
    title: 'Prepare your supporting documents',
    contents: [
      {
        type: 'paragraph',
        text: 'Gather the documents you will need before starting your application. Incomplete applications will not be assessed.',
      },
      {
        type: 'paragraph',
        text: 'Required documents include your most recent audited financial statements, a copy of your certificate of incorporation, and a letter of support from a community partner.',
      },
    ],
  },
  {
    title: 'Submit your application',
    contents: [
      {
        type: 'paragraph',
        text: 'Applications must be submitted through the online grants portal before 5:00 pm on the closing date. Late or emailed applications will not be accepted.',
      },
    ],
  },
];

export default {
  args: (theme = 'light') => ({
    theme,
    heading_level: 2,
    modifier_class: '',
    attributes: null,
    steps: grantSteps,
  }),

  argsWithLinks: (theme = 'light') => ({
    theme,
    heading_level: 2,
    highlight_step: 2,
    show_step: 2,
    modifier_class: '',
    attributes: null,
    steps: [
      {
        title: 'Search for your proposed business name',
        number: 1,
        contents: [
          {
            type: 'paragraph',
            text: 'Check that your proposed name is not already registered or too similar to an existing business name.',
          },
          {
            type: 'list',
            contents: [
              {
                href: '/business/business-name-register/search',
                text: 'Search the Business Names Register',
              },
              {
                href: '/business/trademarks',
                text: 'Check for existing trademark registrations',
              },
            ],
          },
        ],
      },
      {
        title: 'Register your business name',
        number: 2,
        contents: [
          {
            type: 'paragraph',
            text: 'Register your business name through the Australian Business Register. You will need your ABN.',
          },
          {
            type: 'list',
            contents: [
              {
                href: '/business/business-name-register/register',
                text: 'Register a new business name',
                context: '$39 for 1 year, $92 for 3 years',
                active: true,
              },
              {
                href: '/business/business-name-register/renew',
                text: 'Renew an existing business name',
              },
            ],
          },
        ],
      },
      {
        title: 'Set up your business records',
        number: 3,
        contents: [
          {
            type: 'paragraph',
            text: 'Once registered, update your invoices, letterhead, and website to display your registered business name.',
          },
          {
            type: 'list',
            style: 'choice',
            contents: [
              {
                href: '/business/record-keeping/sole-trader',
                text: 'Record-keeping requirements for sole traders',
              },
              {
                href: '/business/record-keeping/company',
                text: 'Record-keeping requirements for companies',
              },
            ],
          },
        ],
      },
    ],
  }),

  argsWithOptionalSteps: (theme = 'light') => ({
    theme,
    heading_level: 2,
    modifier_class: '',
    attributes: null,
    steps: numberedSteps([
      {
        title: 'Confirm whether you need a planning permit',
        contents: [
          {
            type: 'paragraph',
            text: 'Not all development requires a planning permit. Check the planning scheme that applies to your property before preparing an application.',
          },
          {
            type: 'list',
            contents: [
              {
                href: '/planning/check-if-permit-needed',
                text: 'Check if a planning permit is required for your project',
              },
            ],
          },
        ],
      },
      {
        title: 'Prepare your application documents',
        contents: [
          {
            type: 'paragraph',
            text: 'Most applications require a completed application form, a site plan drawn to scale, and a written statement explaining the proposal.',
          },
          {
            type: 'list',
            contents: [
              {
                href: '/planning/application-forms',
                text: 'Download the planning permit application form',
              },
              {
                href: '/planning/site-plan-guide',
                text: 'Guidance on preparing a site plan',
              },
            ],
          },
        ],
      },
      {
        title: 'Lodge your application online',
        logic: 'or',
        optional: true,
        contents: [
          {
            type: 'paragraph',
            text: 'Submit your completed application and supporting documents through the Planning Applications portal.',
          },
          {
            type: 'list',
            contents: [
              {
                href: '/planning/portal/lodge',
                text: 'Lodge a planning permit application online',
                context: 'From $1,270 depending on project cost',
              },
            ],
          },
        ],
      },
      {
        title: 'Lodge your application in person',
        logic: 'or',
        optional: true,
        contents: [
          {
            type: 'paragraph',
            text: 'Bring printed copies of your application and supporting documents to the Planning counter during business hours.',
          },
        ],
      },
      {
        title: 'Track your application',
        contents: [
          {
            type: 'paragraph',
            text: 'After lodgement you will receive a reference number. Council has 60 days to assess standard applications.',
          },
          {
            type: 'list',
            contents: [
              {
                href: '/planning/track-application',
                text: 'Track the progress of your planning permit application',
              },
            ],
          },
        ],
      },
    ]),
  }),

  argsSmall: (theme = 'light') => ({
    theme,
    size: 'small',
    heading_level: 2,
    modifier_class: '',
    attributes: null,
    steps: grantSteps,
  }),

  argsOpenStepByDefault: (theme = 'light') => ({
    theme,
    heading_level: 2,
    show_step: 2,
    modifier_class: '',
    attributes: null,
    steps: grantSteps,
  }),

  argsAllContentTypes: (theme = 'light') => ({
    theme,
    heading_level: 2,
    highlight_step: 3,
    modifier_class: '',
    attributes: null,
    steps: numberedSteps([
      {
        title: 'Check your eligibility to apply for a liquor licence',
        contents: [
          {
            type: 'paragraph',
            text: 'You must be 18 years or older and not disqualified from holding a licence under the Liquor Control Reform Act.',
          },
          {
            type: 'list',
            contents: [
              {
                href: '/liquor/eligibility-requirements',
                text: 'Read the full eligibility requirements for liquor licence applicants',
              },
            ],
          },
        ],
      },
      {
        title: 'Complete responsible service of alcohol training',
        logic: 'and',
        contents: [
          {
            type: 'paragraph',
            text: 'All nominated licensees and key staff must hold a current RSA certificate before the licence is granted.',
          },
          {
            type: 'substep',
            optional: false,
            contents: [
              {
                type: 'heading',
                text: 'Approved training providers',
              },
              {
                type: 'paragraph',
                text: 'Training must be completed with a registered training organisation (RTO) approved by the Victorian Commission for Gambling and Liquor Regulation.',
              },
              {
                type: 'list',
                style: 'choice',
                contents: [
                  {
                    href: '/liquor/rsa-training/online',
                    text: 'Complete RSA training online',
                    context: '$45 to $120',
                  },
                  {
                    href: '/liquor/rsa-training/classroom',
                    text: 'Attend an in-person RSA training session',
                    context: '$95 to $180',
                  },
                ],
              },
            ],
          },
        ],
      },
      {
        title: 'Submit your licence application',
        contents: [
          {
            type: 'paragraph',
            text: 'Lodge your application through the VCGLR online portal. Allow 8 to 12 weeks for assessment.',
          },
          {
            type: 'list',
            contents: [
              {
                href: '/liquor/apply-online',
                text: 'Apply for a general or on-premises liquor licence',
                context: 'From $740.70',
                active: true,
              },
              {
                text: 'or',
              },
              {
                href: '/liquor/apply-paper',
                text: 'Download and post a paper application form',
              },
            ],
          },
          {
            type: 'paragraph',
            text: 'then',
          },
          {
            type: 'list',
            contents: [
              {
                href: '/liquor/public-notice',
                text: 'Display a public notice at the proposed premises for 14 days',
              },
            ],
          },
        ],
      },
      {
        title: 'Attend the compliance inspection',
        contents: [
          {
            type: 'paragraph',
            text: 'A VCGLR inspector will visit the premises before your licence is approved to confirm it meets all requirements.',
          },
          {
            type: 'paragraph',
            text: 'Ensure signage, storage areas, and age verification procedures are in place before the inspection date.',
          },
        ],
      },
    ]),
  }),
};
