import { SVGProps } from 'react';

export const CopyOk = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns='http://www.w3.org/2000/svg'
    width={800}
    height={800}
    fill='none'
    viewBox='0 0 24 24'
    {...props}
  >
    <title>Copied</title>
    <path
      stroke='#292D32'
      strokeLinecap='round'
      strokeLinejoin='round'
      strokeWidth={1.5}
      d='M22 11.1V6.9C22 3.4 20.6 2 17.1 2h-4.2C9.4 2 8 3.4 8 6.9V8h3.1c3.5 0 4.9 1.4 4.9 4.9V16h1.1c3.5 0 4.9-1.4 4.9-4.9Z'
    />
    <path
      stroke='#292D32'
      strokeLinecap='round'
      strokeLinejoin='round'
      strokeWidth={1.5}
      d='M16 17.1v-4.2C16 9.4 14.6 8 11.1 8H6.9C3.4 8 2 9.4 2 12.9v4.2C2 20.6 3.4 22 6.9 22h4.2c3.5 0 4.9-1.4 4.9-4.9Z'
    />
    <path
      stroke='#292D32'
      strokeLinecap='round'
      strokeLinejoin='round'
      strokeWidth={1.5}
      d='m6.08 15 1.95 1.95 3.89-3.9'
    />
  </svg>
);
