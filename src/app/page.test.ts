import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import { LoginPage } from './LoginPage'; // Suponiendo que LoginPage está en un archivo separado
import { AuthContext } from '../context/AuthContext'; // Ajusta la ruta si es necesario
import { useRouter } from 'next/navigation';

// Mock del contexto de autenticación y del router de Next.js
jest.mock('../context/AuthContext', () => ({
    useAuth: () => ({
        login: jest.fn().mockResolvedValue(), // Simula una promesa resuelta
        loading: false,
        error: null,
    }),
}));

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

describe('LoginPage', () => {
    it('debe renderizar el formulario de inicio de sesión', () => {
        const { getByPlaceholderText, getByText } = render(<LoginPage />);
        expect(getByPlaceholderText('Email')).toBeInTheDocument();
        expect(getByText('Login')).toBeInTheDocument();
    });

    it('debe llamar a la función de inicio de sesión con el email correcto', async () => {
        const { getByPlaceholderText, getByText } = render(<LoginPage />);
        const emailInput = getByPlaceholderText('Email');
        const loginButton = getByText('Login');
        const mockLogin = jest.fn().mockResolvedValue(); // Simula la función login
        useAuth.mockImplementationOnce(() => ({ // Usa mockImplementationOnce
            login: mockLogin,
            loading: false,
            error: null,
        }));
        fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
        fireEvent.click(loginButton);
        await waitFor(() => expect(mockLogin).toHaveBeenCalledWith('test@example.com'));
    });

    it('debe mostrar un mensaje de error si el email no es válido', async () => {
        const { getByText } = render(<LoginPage />);
        const loginButton = getByText('Login');
        fireEvent.click(loginButton); // Clic sin email
        await waitFor(() => expect(getByText('Email is required')).toBeInTheDocument());
    });

    it('debe redirigir a la página principal después del inicio de sesión exitoso', async () => {
        const { getByPlaceholderText, getByText } = render(<LoginPage />);
        const emailInput = getByPlaceholderText('Email');
        const loginButton = getByText('Login');
        const mockPush = jest.fn();
        useRouter.mockImplementationOnce(() => ({
            push: mockPush,
        }));

        fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
        fireEvent.click(loginButton);
        await waitFor(() => expect(mockPush).toHaveBeenCalledWith('/'));
    });
});
