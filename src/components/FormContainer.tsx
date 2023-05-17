import type { FC, ReactNode } from 'react';
import { textSize } from '../utils/const';
import type { ICssSizes } from '../interfaces';

type IProps = {
  children: ReactNode;
  title: string;
  onSubmit: (e: React.FormEvent) => void;
  containerWidth?: 'full' | 'none' | Exclude<ICssSizes, '8xl' | '9xl'>;
  titleSize?: keyof typeof textSize;
};

// TODO: Pass a onSubmit function for the form
export const FormContainer: FC<IProps> = ({
  children,
  title,
  containerWidth,
  titleSize,
  onSubmit,
}) => {
  return (
    <div className={`w-full  max-w-${containerWidth || 'sm'}`}>
      <form
        onSubmit={onSubmit}
        className='px-8 pt-6 pb-8 mb-4 rounded shadow-md bg-gradient-to-tl from-emerald-400 to-cyan-400'
      >
        <h3 className={`mb-2 font-bold ${textSize[titleSize || 'xl3']}`}>
          {title}
        </h3>
        {children}
      </form>
    </div>
  );
};

FormContainer.defaultProps = {
  containerWidth: 'sm',
  titleSize: 'xl3',
};