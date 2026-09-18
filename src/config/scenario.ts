/** The case as presented on the front of the room. Edit freely. */
export const SCENARIO = {
  company: 'Kelso Foodservice Equipment',
  tagline: 'A manufacturer and distributor of commercial kitchen equipment',
  facts: [
    { label: 'Annual revenue', value: '$1.2B' },
    { label: 'Employees', value: '4,200' },
    { label: 'Manufacturing plants', value: '3' },
    { label: 'Distribution center', value: '1' },
  ],
  situation: [
    'Builds ranges, fryers, walk-in coolers, dish machines, and prep tables. Sells through 900 dealers to restaurants, hotels, and institutional kitchens.',
    'Acquired a competing commercial refrigeration brand 18 months ago. That brand still runs its own separate systems.',
    'Three disconnected legacy systems today: finance, warehouse management, and a homegrown order-entry tool.',
  ],
  pain: [
    'Finished units and service parts are counted differently in two systems, so nobody trusts the inventory number.',
    'Financial close takes 15 business days.',
    'Sales reps quote dealers from a credit report that can be up to a week stale.',
  ],
  role: 'Your group is the ERP implementation steering committee.',
  budget: 'You have $15 million and four decisions to make.',
  decisions: [
    { round: 1, title: 'Scope & Timeline', blurb: 'How much of the company goes onto the new system, and how fast.' },
    { round: 2, title: 'Platform & Data', blurb: 'Which platform, and what to do with twenty years of legacy data.' },
    { round: 3, title: 'People & Change', blurb: 'How 4,200 employees learn to work in a new system.' },
    { round: 4, title: 'Go-Live', blurb: 'Whether to hit the date when testing is not finished.' },
  ],
  howScored: [
    'Every option has a cost that comes out of your $15M right away.',
    'Your line on the chart drops as you spend. That is money out the door.',
    'Value only starts pulling the line back up once the system is live and working.',
    'After the final decision, we find out how much of that value you actually captured. Groups are ranked by return on investment.',
  ],
  overrun: 'You may go over budget. The board will fund an overrun, but every $1 over $15M costs $1.50.',
  reminder: 'The most expensive option in every round does not fit in $15M. Trade something off, or pay the board’s price to go over.',
}
