import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import Card, { CardHeader, CardContent, CardFooter } from '../Card';
import { Text, View } from 'react-native';

// Mock useTheme hook
jest.mock('../../../context/ThemeContext', () => ({
  useTheme: () => ({
    theme: {
      colors: {
        elevation: {
          level1: '#f5f5f5',
          level2: '#e0e0e0',
        },
        surfaceVariant: '#f0f0f0',
        surface: '#ffffff',
        outline: '#cccccc',
      },
      roundness: 8,
    },
    isDark: false,
  }),
}));

describe('Card Component', () => {
  it('renders correctly with default props', () => {
    const { getByTestId } = render(
      <Card testID="test-card">
        <Text>Card Content</Text>
      </Card>
    );
    
    expect(getByTestId('test-card')).toBeTruthy();
  });
  
  it('applies different styles based on variant prop', () => {
    const { rerender, getByTestId } = render(
      <Card testID="test-card" variant="default">
        <Text>Card Content</Text>
      </Card>
    );
    
    let card = getByTestId('test-card');
    expect(card.props.style).toBeDefined();
    
    // Test elevated variant
    rerender(
      <Card testID="test-card" variant="elevated">
        <Text>Card Content</Text>
      </Card>
    );
    
    card = getByTestId('test-card');
    expect(card.props.style).toBeDefined();
    
    // Test outlined variant
    rerender(
      <Card testID="test-card" variant="outlined">
        <Text>Card Content</Text>
      </Card>
    );
    
    card = getByTestId('test-card');
    expect(card.props.style).toBeDefined();
    
    // Test flat variant
    rerender(
      <Card testID="test-card" variant="flat">
        <Text>Card Content</Text>
      </Card>
    );
    
    card = getByTestId('test-card');
    expect(card.props.style).toBeDefined();
  });
  
  it('calls onPress when pressed', () => {
    const onPressMock = jest.fn();
    const { getByTestId } = render(
      <Card testID="test-card" onPress={onPressMock}>
        <Text>Card Content</Text>
      </Card>
    );
    
    fireEvent.press(getByTestId('test-card'));
    expect(onPressMock).toHaveBeenCalledTimes(1);
  });
  
  it('does not call onPress when disabled', () => {
    const onPressMock = jest.fn();
    const { getByTestId } = render(
      <Card testID="test-card" onPress={onPressMock} disabled>
        <Text>Card Content</Text>
      </Card>
    );
    
    fireEvent.press(getByTestId('test-card'));
    expect(onPressMock).not.toHaveBeenCalled();
  });
  
  it('renders card sections correctly', () => {
    const { getByText } = render(
      <Card>
        <CardHeader>
          <Text>Header</Text>
        </CardHeader>
        <CardContent>
          <Text>Content</Text>
        </CardContent>
        <CardFooter>
          <Text>Footer</Text>
        </CardFooter>
      </Card>
    );
    
    expect(getByText('Header')).toBeTruthy();
    expect(getByText('Content')).toBeTruthy();
    expect(getByText('Footer')).toBeTruthy();
  });
}); 