import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { render } from '../../../test/test-utils';
import ModeSidebar from '../ModeSidebar';

describe('ModeSidebar', () => {
  it('Playgroundリンクを表示しない', () => {
    render(<ModeSidebar />);

    expect(screen.queryByLabelText('Playground')).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Playground' })).not.toBeInTheDocument();
  });
});
