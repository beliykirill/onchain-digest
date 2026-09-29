import styled from 'styled-components';
import { Button } from 'shared/ui/button';
import { CaptionText } from 'shared/ui/text';

export const ErrorContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
  gap: 4px;
  min-height: 100%;
  padding: 8px 0;

  ${Button} {
    margin-top: 12px;
  }
`;

export const ErrorText = styled(CaptionText)`
  max-width: 360px;
`;
