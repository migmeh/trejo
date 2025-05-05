'use client'
import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Plus,
    GripVertical,
    Loader2,
    CheckCircle,
    XCircle,
    AlertTriangle,
    LogIn,
    LogOut,
    UserPlus,
    List,
    CheckSquare,
    Edit,
    Trash2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';

import { cn } from '@/lib/utils';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import Link from 'next/link'; // Importa el componente Link de Next.js
import { useRouter } from 'next/navigation'; // Importa el hook useRouter

// ===============================
// Tipos y Interfaces
// ===============================

interface User {
    id: number;
    email: string;
}

interface Task {
    id: string;
    title: string;
    description?: string;
    listId: string;
    completed: boolean;
    order: number; // Añadido para el orden dentro de la lista
}

interface List {
    id: string;
    title: string;
    taskIds: string[]; // IDs de las tareas en esta lista, manteniendo el orden
}

interface Board {
    lists: Record<string, List>;
    tasks: Record<string, Task>;
}

// ===============================
// Contexto de Autenticación (Simulado)
// ===============================
const AuthContext = React.createContext<{
    user: User | null;
    login: (email: string) => Promise<void>;
    signup: (email: string) => Promise<void>;
    logout: () => void;
    loading: boolean;
    error: string | null;
}>({
    user: null,
    login: async () => { },
    signup: async () => { },
    logout: () => { },
    loading: false,
    error: null,
});

const useAuth = () => React.useContext(AuthContext);

// ===============================
// Contexto del Tablero (Simulado)
// ===============================

const BoardContext = React.createContext<{
    board: Board;
    addTask: (listId: string, title: string, description?: string) => void;
    updateTask: (taskId: string, updates: Partial<Omit<Task, 'id' | 'listId'>>) => void;
    moveTask: (taskId: string, sourceListId: string, destinationListId: string, newIndex: number) => void;
    addList: (title: string) => void;
    deleteList: (listId: string) => void;
    deleteTask: (taskId: string) => void;
    loading: boolean;
    error: string | null;
    reorderTask: (listId: string, taskId: string, newIndex: number) => void;
}>({
    board: { lists: {}, tasks: {} },
    addTask: () => { },
    updateTask: () => { },
    moveTask: () => { },
    addList: () => { },
    deleteList: () => { },
    deleteTask: () => { },
    loading: false,
    error: null,
    reorderTask: () => { },
});

const useBoard = () => React.useContext(BoardContext);

// ===============================
// Hooks Personalizados
// ===============================

// Hook para simular la API de ReqRes
const useReqRes = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const request = useCallback(async (endpoint: string, options: RequestInit) => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`https://reqres.in/api${endpoint}`, {
                ...options,
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': 'reqres-free-v1', // Agregada la API key
                    ...options.headers,
                },
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            return data;
        } catch (error: any) {
            setError(error.message);
            throw error; // Re-throw para que el llamador pueda manejarlo también
        } finally {
            setLoading(false);
        }
    }, []);

    return { request, loading, error };
};

// ===============================
// Componentes de Autenticación
// ===============================

const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { request } = useReqRes();

    // Simulación de inicio de sesión
    const login = useCallback(async (email: string) => {
        try {
            const data = await request('/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password: 'password' }), // ReqRes requiere 'password'
            });
            // Simulación de token y datos de usuario
            const simulatedUser: User = { id: data.token ? parseInt(data.token) : 1, email };
            setUser(simulatedUser);
            localStorage.setItem('user', JSON.stringify(simulatedUser)); // Simulación de persistencia
        } catch (err: any) {
            setError(err.message || 'Failed to login');
        }
    }, [request]);

    // Simulación de registro
    const signup = useCallback(async (email: string) => {
        try {
            const data = await request('/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password: 'password' }), // ReqRes requiere 'password'
            });
            // Simulación de token y datos de usuario
            const simulatedUser: User = { id: data.id, email };
            setUser(simulatedUser);
            localStorage.setItem('user', JSON.stringify(simulatedUser));  // Simulación de persistencia
        } catch (err: any) {
            setError(err.message || 'Failed to sign up');
        }
    }, [request]);

    // Cierre de sesión
    const logout = () => {
        setUser(null);
        localStorage.removeItem('user'); // Simulación de eliminar datos de sesión
    };

    // Cargar el usuario desde localStorage al inicio (simulación de sesión persistente)
    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            try {
                setUser(JSON.parse(storedUser));
            } catch (e) {
                console.error('Error parsing user from localStorage', e);
                localStorage.removeItem('user'); // Limpiar si hay datos corruptos
            }
        }
    }, []);

    const contextValue = {
        user,
        login,
        signup,
        logout,
        loading,
        error,
    };

    return (
        <AuthContext.Provider value={contextValue}>
            {children}
        </AuthContext.Provider>
    );
};

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const { login, loading, error } = useAuth();
    const [localError, setLocalError] = useState<string | null>(null); // Manejo de errores locales
    const router = useRouter();


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLocalError(null); // Limpiar errores locales al intentar de nuevo
        if (!email.trim()) {
            setLocalError("Email is required");
            return;
        }
        await login(email);
        router.push('/'); // Redirige al tablero después del inicio de sesión
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle className="text-center">
                        <LogIn className="inline-block mr-2" />
                        Login
                    </CardTitle>
                    <CardDescription className="text-center">
                        Enter your email to log in
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Input
                                type="email"
                                placeholder="Email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full"
                                disabled={loading}
                            />
                        </div>
                        <Button type="submit" className="w-full" disabled={loading}>
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Logging in...
                                </>
                            ) : (
                                "Login"
                            )}
                        </Button>
                        {(error || localError) && ( // Mostrar errores de ambos contextos
                            <div className="text-red-500 text-sm">
                                <AlertTriangle className="inline-block mr-1" size={16} />
                                {error || localError}
                            </div>
                        )}
                    </form>
                </CardContent>
            </Card>
        </div>
    );
};

const SignupPage = () => {
    const [email, setEmail] = useState('');
    const { signup, loading, error } = useAuth();
    const [localError, setLocalError] = useState<string | null>(null);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLocalError(null);
        if (!email.trim()) {
            setLocalError("Email is required");
            return;
        }
        await signup(email);
        router.push('/'); // Redirige al tablero después del registro
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle className="text-center">
                        <UserPlus className="inline-block mr-2" />
                        Sign Up
                    </CardTitle>
                    <CardDescription className="text-center">
                        Enter your email to create an account
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Input
                                type="email"
                                placeholder="Email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full"
                                disabled={loading}
                            />
                        </div>
                        <Button type="submit" className="w-full" disabled={loading}>
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Signing up...
                                </>
                            ) : (
                                "Sign Up"
                            )}
                        </Button>
                        {(error || localError) && (
                            <div className="text-red-500 text-sm">
                                <AlertTriangle className="inline-block mr-1" size={16} />
                                {error || localError}
                            </div>
                        )}
                    </form>
                </CardContent>
            </Card>
        </div>
    );
};

// ===============================
// Componentes del Tablero
// ===============================

const BoardProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [board, setBoard] = useState<Board>({ lists: {}, tasks: {} });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Función para generar IDs únicas
    const generateId = () => crypto.randomUUID();

    // Función para agregar una nueva tarea a una lista
    const addTask = (listId: string, title: string, description?: string) => {
        if (!board.lists[listId]) {
            console.error(`List with id ${listId} does not exist`);
            return; // Important: Exit if list doesn't exist
        }
        const taskId = generateId();
        const newTask: Task = {
            id: taskId,
            title,
            description,
            listId,
            completed: false,
            order: board.lists[listId].taskIds.length, // Añadir al final de la lista
        };

        setBoard(prevBoard => {
            // Check again inside the state update for correctness
            if (!prevBoard.lists[listId]) {
                return prevBoard; // Do not proceed if the list suddenly disappeared
            }
            const updatedBoard = {
                ...prevBoard,
                tasks: {
                    ...prevBoard.tasks,
                    [taskId]: newTask,
                },
                lists: {
                    ...prevBoard.lists,
                    [listId]: {
                        ...prevBoard.lists[listId],
                        taskIds: [...prevBoard.lists[listId].taskIds, taskId], // Añadir ID al final
                    },
                },
            };
            localStorage.setItem('kanbanBoard', JSON.stringify(updatedBoard)); // Persistir en localStorage
            return updatedBoard;
        });
    };

    // Función para actualizar una tarea existente
    const updateTask = (taskId: string, updates: Partial<Omit<Task, 'id' | 'listId'>>) => {
        setBoard(prevBoard => {
            if (!prevBoard.tasks[taskId]) return prevBoard; // Check if task exists
            const updatedBoard = {
                ...prevBoard,
                tasks: {
                    ...prevBoard.tasks,
                    [taskId]: {
                        ...prevBoard.tasks[taskId],
                        ...updates,
                    },
                },
            };
            localStorage.setItem('kanbanBoard', JSON.stringify(updatedBoard));
            return updatedBoard;
        });
    };

    // Función para mover una tarea entre listas y cambiar su posición
    const moveTask = (taskId: string, sourceListId: string, destinationListId: string, newIndex: number) => {
        setBoard(prevBoard => {
            // Validar que las listas y la tarea existan
            if (!prevBoard.lists[sourceListId] || !prevBoard.lists[destinationListId] || !prevBoard.tasks[taskId]) {
                console.error("Invalid list or task ID in moveTask");
                return prevBoard;
            }

            // Si la tarea ya está en la lista de destino, solo reordenarla
            if (sourceListId === destinationListId) {
                const taskIds = [...prevBoard.lists[sourceListId].taskIds];
                const currentIndex = taskIds.indexOf(taskId);

                // Si el índice es el mismo, no hacer nada
                if (currentIndex === newIndex) return prevBoard;

                // Remover tarea del índice actual
                taskIds.splice(currentIndex, 1);
                // Insertar en el nuevo índice
                taskIds.splice(newIndex, 0, taskId);

                // Actualizar el orden de las tareas en la lista
                const updatedTasks = taskIds.map((id, index) => ({
                    ...prevBoard.tasks[id],
                    order: index, // Actualizar el orden
                }));

                // Crear un nuevo objeto de tareas para evitar mutaciones directas
                const newTasks: Record<string, Task> = {};
                updatedTasks.forEach(task => {
                    newTasks[task.id] = task;
                });
                const updatedBoard = {
                    ...prevBoard,
                    lists: {
                        ...prevBoard.lists,
                        [sourceListId]: {
                            ...prevBoard.lists[sourceListId],
                            taskIds: taskIds,
                        },
                    },
                    tasks: newTasks, // Usar el nuevo objeto de tareas
                };
                localStorage.setItem('kanbanBoard', JSON.stringify(updatedBoard));
                return updatedBoard;
            } else { // Mover entre listas
                // Remover tarea de la lista de origen
                const sourceTaskIds = [...prevBoard.lists[sourceListId].taskIds];
                const taskIndex = sourceTaskIds.indexOf(taskId);
                if (taskIndex === -1) {
                    console.error("Task not found in source list");
                    return prevBoard;
                }
                sourceTaskIds.splice(taskIndex, 1);

                // Insertar tarea en la lista de destino
                const destTaskIds = [...prevBoard.lists[destinationListId].taskIds];
                destTaskIds.splice(newIndex, 0, taskId);

                // Actualizar el orden de las tareas en la lista de destino
                const updatedDestTasks = destTaskIds.map((id, index) => ({
                    ...prevBoard.tasks[id],
                    listId: destinationListId, // Actualizar listId
                    order: index, // Actualizar el orden
                }));

                // Crear un nuevo objeto de tareas para la lista de destino
                const newDestTasks: Record<string, Task> = {};
                updatedDestTasks.forEach(task => {
                    newDestTasks[task.id] = task;
                });

                const updatedBoard = {
                    ...prevBoard,
                    lists: {
                        ...prevBoard.lists,
                        [sourceListId]: {
                            ...prevBoard.lists[sourceListId],
                            taskIds: sourceTaskIds,
                        },
                        [destinationListId]: {
                            ...prevBoard.lists[destinationListId],
                            taskIds: destTaskIds,
                        },
                    },
                    tasks: {
                        ...prevBoard.tasks,
                        [taskId]: {
                            ...prevBoard.tasks[taskId],
                            listId: destinationListId, // Actualizar listId de la tarea
                        },
                        ...newDestTasks, // Combinar las tareas actualizadas de la lista de destino
                    },
                };
                localStorage.setItem('kanbanBoard', JSON.stringify(updatedBoard));
                return updatedBoard;
            }
        });
    };

    // Función para agregar una nueva lista
    const addList = (title: string) => {
        const listId = generateId();
        const newList: List = {
            id: listId,
            title,
            taskIds: [],
        };
        setBoard(prevBoard => {
            const updatedBoard = {
                ...prevBoard,
                lists: {
                    ...prevBoard.lists,
                    [listId]: newList,
                },
            };
            localStorage.setItem('kanbanBoard', JSON.stringify(updatedBoard));
            return updatedBoard;
        });
    };

    // Función para eliminar una lista y sus tareas asociadas
    const deleteList = (listId: string) => {
        setBoard(prevBoard => {
            if (!prevBoard.lists[listId]) return prevBoard; // Check if list exists

            const { [listId]: deletedList, ...restLists } = prevBoard.lists; // Eliminar la lista
            const tasksToDelete = deletedList.taskIds;

            // Eliminar las tareas asociadas a la lista
            const newTasks = { ...prevBoard.tasks };
            tasksToDelete.forEach(taskId => {
                delete newTasks[taskId];
            });
            const updatedBoard = {
                lists: restLists,
                tasks: newTasks,
            };
            localStorage.setItem('kanbanBoard', JSON.stringify(updatedBoard));
            return updatedBoard;
        });
    };

    // Función para eliminar una tarea
    const deleteTask = (taskId: string) => {
        setBoard(prevBoard => {
            const taskToDelete = prevBoard.tasks[taskId];
            if (!taskToDelete) return prevBoard; // Check if task exists

            const listId = taskToDelete.listId;
            const updatedLists = { ...prevBoard.lists };

            // Remover la tarea de la lista
            if (updatedLists[listId]) {
                updatedLists[listId] = {
                    ...updatedLists[listId],
                    taskIds: updatedLists[listId].taskIds.filter(id => id !== taskId),
                };
            }

            // Eliminar la tarea del objeto de tareas
            const { [taskId]: deletedTask, ...restTasks } = prevBoard.tasks;
            const updatedBoard = {
                lists: updatedLists,
                tasks: restTasks,
            };
            localStorage.setItem('kanbanBoard', JSON.stringify(updatedBoard));
            return updatedBoard;
        });
    };

    // Función para reordenar una tarea dentro de la misma lista
    const reorderTask = (listId: string, taskId: string, newIndex: number) => {
        setBoard(prevBoard => {
            if (!prevBoard.lists[listId]) return prevBoard;

            const taskIds = [...prevBoard.lists[listId].taskIds];
            const currentIndex = taskIds.indexOf(taskId);

            // Si el índice es el mismo, no hacer nada
            if (currentIndex === newIndex) return prevBoard;

            // Remover del índice actual
            taskIds.splice(currentIndex, 1);
            // Insertar en el nuevo índice
            taskIds.splice(newIndex, 0, taskId);

            // Actualizar el orden de las tareas
            const updatedTasks = taskIds.map((id, index) => ({
                ...prevBoard.tasks[id],
                order: index,
            }));

            const newTasks: Record<string, Task> = {};
            updatedTasks.forEach(task => {
                newTasks[task.id] = task;
            });

            const updatedBoard = {
                ...prevBoard,
                lists: {
                    ...prevBoard.lists,
                    [listId]: {
                        ...prevBoard.lists[listId],
                        taskIds: taskIds,
                    },
                },
                tasks: newTasks, // Usar el nuevo objeto de tareas
            };
            localStorage.setItem('kanbanBoard', JSON.stringify(updatedBoard));
            return updatedBoard;
        });
    };

    // Simulación de carga inicial de datos
    useEffect(() => {
        // Cargar el tablero desde localStorage
        const storedBoard = localStorage.getItem('kanbanBoard');
        if (storedBoard) {
            try {
                setBoard(JSON.parse(storedBoard));
            } catch (error) {
                console.error("Failed to parse kanbanBoard from localStorage", error);
                // Si hay un error al parsear, inicializar con datos vacíos o los datos por defecto
                setBoard({ lists: {}, tasks: {} });
            }
        } else {
            // Simulación de datos iniciales del tablero desde una API (ReqRes no tiene esto)
            const initialData: Board = {
                lists: {
                    'list-1': {
                        id: 'list-1',
                        title: 'Por Hacer',
                        taskIds: ['task-1', 'task-2'],
                    },
                    'list-2': {
                        id: 'list-2',
                        title: 'En Progreso',
                        taskIds: ['task-3'],
                    },
                    'list-3': {
                        id: 'list-3',
                        title: 'Hecho',
                        taskIds: [],
                    },
                },
                tasks: {
                    'task-1': {
                        id: 'task-1',
                        title: 'Diseñar la interfaz de usuario',
                        description: 'Crear wireframes y maquetas de la interfaz de usuario.',
                        listId: 'list-1',
                        completed: false,
                        order: 0,
                    },
                    'task-2': {
                        id: 'task-2',
                        title: 'Desarrollar la lógica de autenticación',
                        description: 'Implementar el inicio de sesión y el registro de usuarios.',
                        listId: 'list-1',
                        completed: false,
                        order: 1,
                    },
                    'task-3': {
                        id: 'task-3',
                        title: 'Implementar el tablero Kanban',
                        description: 'Crear las listas y la funcionalidad de arrastrar y soltar.',
                        listId: 'list-2',
                        completed: false,
                        order: 0,
                    },
                },
            };
            setBoard(initialData);
            localStorage.setItem('kanbanBoard', JSON.stringify(initialData));
        }
    }, []);

    const contextValue = {
        board,
        addTask,
        updateTask,
        moveTask,
        addList,
        deleteList,
        deleteTask,
        loading,
        error,
        reorderTask,
    };

    return (
        <BoardContext.Provider value={contextValue}>
            {children}
        </BoardContext.Provider>
    );
};

const TaskCard: React.FC<{ taskId: string }> = ({ taskId }) => {
    const { board, updateTask, deleteTask } = useBoard();
    const task = board.tasks[taskId];
    const [isEditing, setIsEditing] = useState(false);
    const [title, setTitle] = useState(task.title);
    const [description, setDescription] = useState(task.description || '');
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    if (!task) {
        return <div className="text-red-500">Task not found</div>;
    }

    const handleSave = () => {
        updateTask(taskId, { title, description });
        setIsEditing(false);
    };

    return (
        <>
            <motion.div
                layout
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="bg-white/10 p-4 rounded-lg shadow-md border border-white/20 backdrop-blur-md"
            >
                {isEditing ? (
                    <div className="space-y-4">
                        <Input
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full bg-black/20 text-white"
                        />
                        <Textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="w-full bg-black/20 text-white"
                        />
                        <div className="flex justify-end gap-2">
                            <Button variant="outline" size="sm" onClick={handleSave} className="bg-green-500/20 text-green-400">
                                <CheckCircle className="mr-2" size={16} /> Save
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => setIsEditing(false)} className="bg-gray-500/20 text-gray-400">
                                Cancel
                            </Button>
                        </div>
                    </div>
                ) : (<div className="space-y-2">
                        <div className="flex justify-between items-start">
                            <h3 className="text-lg font-semibold text-white">{task.title}</h3>
                            <div className="flex gap-1">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setIsEditing(true)}
                                    className="text-gray-400 hover:text-blue-400"
                                    title="Edit Task"
                                >
                                    <Edit size={16} />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setShowDeleteModal(true)}
                                    className="text-gray-400 hover:text-red-400"
                                    title="Delete Task"
                                >
                                    <Trash2 size={16} />
                                </Button>
                            </div>
                        </div>
                        {task.description && <p className="text-gray-300">{task.description}</p>}
                        <div className="flex items-center justify-between">
                            <span className={cn(
                                "text-sm",
                                task.completed ? "text-green-400" : "text-yellow-400"
                            )}>
                                {task.completed ? "Completed" : "Incomplete"}
                            </span>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => updateTask(taskId, { completed: !task.completed })}
                                className={cn(
                                    "px-2 py-1 text-xs",
                                    task.completed
                                        ? "bg-green-500/20 text-green-400 hover:bg-green-500/30"
                                        : "bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30"
                                )}
                            >
                                {task.completed ? "Mark Incomplete" : "Mark Complete"}
                            </Button>
                        </div>
                    </div>
                )}
            </motion.div>
            <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
                <DialogContent className="bg-gray-800 text-white border-gray-700">
                    <DialogHeader>
                        <DialogTitle className="text-red-400">
                            <AlertTriangle className="inline-block mr-2" size={20} />
                            Delete Task
                        </DialogTitle>
                        <DialogDescription className="text-gray-300">
                            Are you sure you want to delete this task? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowDeleteModal(false)} className="bg-gray-500/20 text-gray-400">
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={() => {
                                deleteTask(taskId);
                                setShowDeleteModal(false);
                            }}
                            className="bg-red-500/20 text-red-400 hover:bg-red-500/30"
                        >
                            Delete
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
};




const ListColumn: React.FC<{ listId: string }> = ({ listId }) => {
    const { board, addTask, moveTask, deleteList, reorderTask } = useBoard();
    const list = board.lists[listId];
    const [newTaskTitle, setNewTaskTitle] = useState('');
    const [isAddingTask, setIsAddingTask] = useState(false);
    const [isDeletingList, setIsDeletingList] = useState(false); // Estado para el modal de eliminación de lista

    if (!list) {
        return <div className="text-red-500">List not found</div>;
    }

    const handleAddTask = () => {
        if (newTaskTitle.trim()) {
            addTask(listId, newTaskTitle);
            setNewTaskTitle('');
            setIsAddingTask(false);
        }
    };

    const handleDrop = (draggedTaskId: string, targetIndex: number) => {
        const sourceListId = board.tasks[draggedTaskId].listId;
        moveTask(draggedTaskId, sourceListId, listId, targetIndex);
    };

    const sortedTasks = list.taskIds.map(taskId => board.tasks[taskId]).sort((a, b) => a.order - b.order);

    return (
        <div className="w-full max-w-sm">
            <motion.div
                layout
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="bg-gray-800 p-4 rounded-lg shadow-lg border border-gray-700 space-y-4"
            >
                <div className="flex justify-between items-center">
                    <h2 className="text-xl font-semibold text-white flex items-center">
                        <List className="mr-2" size={20} />
                        {list.title}
                    </h2>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setIsDeletingList(true)} // Mostrar modal al hacer clic
                        className="text-gray-400 hover:text-red-400"
                        title="Delete List"
                    >
                        <Trash2 size={16} />
                    </Button>
                </div>
                <div className="space-y-2">
                    <AnimatePresence>
                        {sortedTasks.map((task, index) => (
                            <motion.div
                                key={task.id}
                                draggable="true"
                                onDragStart={(e) => e.dataTransfer.setData('text/plain', task.id)}
                                onDragOver={(e) => e.preventDefault()}
                                onDrop={(e) => {
                                    e.preventDefault();
                                    const droppedTaskId = e.dataTransfer.getData('text/plain');
                                    if (droppedTaskId !== task.id) { // Prevent reordering the same task
                                        handleDrop(droppedTaskId, index);
                                    }
                                }}
                                className="relative" // Make sure the parent is relative for absolute positioning
                            >
                                {/* Mostrar indicador de arrastre */}
                                {index === 0 && (
                                    <div
                                        onDragOver={(e) => e.preventDefault()}
                                        onDrop={(e) => {
                                            e.preventDefault();
                                            const droppedTaskId = e.dataTransfer.getData('text/plain');
                                            handleDrop(droppedTaskId, 0); // Insert at the beginning
                                        }}
                                        className="absolute top-[-4px] left-1/2 transform -translate-x-1/2 w-1/2 h-1 bg-blue-500/50 rounded-full"
                                    />
                                )}
                                <TaskCard taskId={task.id} />
                                {/* Mostrar indicador de arrastre */}
                                <div
                                    onDragOver={(e) => e.preventDefault()}
                                    onDrop={(e) => {
                                        e.preventDefault();
                                        const droppedTaskId = e.dataTransfer.getData('text/plain');
                                        handleDrop(droppedTaskId, index + 1); // Insert after this task
                                    }}
                                    className="absolute bottom-[-4px] left-1/2 transform -translate-x-1/2 w-1/2 h-1 bg-blue-500/50 rounded-full"
                                />
                            </motion.div>
                        ))}
                    </AnimatePresence>
                    {/* Si no hay tareas, mostrar indicador de soltar */}
                    {list.taskIds.length === 0 && (
                        <div
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={(e) => {
                                e.preventDefault();
                                const droppedTaskId = e.dataTransfer.getData('text/plain');
                                handleDrop(droppedTaskId, 0); // Drop into empty list
                            }}
                            className="w-full h-8 bg-blue-500/20 rounded-md border-2 border-dashed border-blue-500/30 text-center text-blue-300"
                        >
                            Arrastra una tarea aquí
                        </div>
                    )}
                </div>
                {isAddingTask ? (
                    <div className="space-y-2">
                        <Input
                            placeholder="Task title..."
                            value={newTaskTitle}
                            onChange={(e) => setNewTaskTitle(e.target.value)}
                            className="w-full bg-black/20 text-white"
                        />
                        <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={handleAddTask} className="bg-green-500/20 text-green-400">
                                <Plus className="mr-2" size={16} /> Add
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => setIsAddingTask(false)} className="bg-gray-500/20 text-gray-400">
                                Cancel
                            </Button>
                        </div>
                    </div>
                ) : (
                    <Button
                        variant="outline"
                        onClick={() => setIsAddingTask(true)}
                        className="w-full bg-blue-500/20 text-blue-400 hover:bg-blue-500/30"
                    >
                        <Plus className="mr-2" size={16} /> Add Task
                    </Button>
                )}
            </motion.div>
            {/* Modal de confirmación para eliminar la lista */}
            <Dialog open={isDeletingList} onOpenChange={setIsDeletingList}>
                <DialogContent className="bg-gray-800 text-white border-gray-700">
                    <DialogHeader>
                        <DialogTitle className="text-red-400">
                            <AlertTriangle className="inline-block mr-2" size={20} />
                            Delete List
                        </DialogTitle>
                        <DialogDescription className="text-gray-300">
                            Are you sure you want to delete this list and all its tasks? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDeletingList(false)} className="bg-gray-500/20 text-gray-400">
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={() => {
                                deleteList(listId);
                                setIsDeletingList(false);
                            }}
                            className="bg-red-500/20 text-red-400 hover:bg-red-500/30"
                        >
                            Delete
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

const BoardPage = () => {
    const { board, addList, loading, error } = useBoard();
    const [newListTitle, setNewListTitle] = useState('');
    const [isAddingList,setIsAddingList] = useState(false);

    const handleAddList = () => {
        if (newListTitle.trim()) {
            addList(newListTitle);
            setNewListTitle('');
            setIsAddingList(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
                <Loader2 className="h-10 w-10 animate-spin text-gray-500" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 text-red-500">
                Error: {error}
            </div>
        );
    }

    return (
        <div className="bg-gray-900 min-h-screen p-4 overflow-x-auto">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6">
                <h1 className="text-3xl font-bold text-white mb-4 md:mb-0 flex items-center">
                    <List className="mr-2" size={30} />
                    My Board
                </h1>
                {isAddingList ? (
                    <div className="flex items-center gap-2">
                        <Input
                            placeholder="List title..."
                            value={newListTitle}
                            onChange={(e) => setNewListTitle(e.target.value)}
                            className="bg-black/20 text-white"
                        />
                        <Button variant="outline" onClick={handleAddList} className="bg-green-500/20 text-green-400">
                            <Plus className="mr-2" size={16} /> Add
                        </Button>
                        <Button variant="outline" onClick={() => setIsAddingList(false)} className="bg-gray-500/20 text-gray-400">
                            Cancel
                        </Button>
                    </div>
                ) : (
                    <Button
                        variant="outline"
                        onClick={() => setIsAddingList(true)}
                        className="bg-blue-500/20 text-blue-400 hover:bg-blue-500/30"
                    >
                        <Plus className="mr-2" size={16} /> Add List
                    </Button>
                )}
            </div>
            <div className="flex gap-4">
                {Object.keys(board.lists).map(listId => (
                    <ListColumn key={listId} listId={listId} />
                ))}
            </div>
        </div>
    );
};

// ===============================
// Componente de la Aplicación Principal
// ===============================

const App = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const { user, logout } = useAuth();
    const router = useRouter();


    useEffect(() => {
        // Simulación de verificación de autenticación
        setIsAuthenticated(!!user);
    }, [user]);

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
            {/* Barra de navegación simulada */}
            <nav className="bg-gray-800 p-4 text-white flex justify-between items-center">
                <div className="font-bold text-xl">
                    <List className="inline-block mr-2" size={24} />
                    Task Board
                </div>
                {isAuthenticated ? (
                    <div className="flex items-center gap-4">
                        <span>Logged in as: {user?.email}</span>
                        <Button variant="outline" onClick={logout} className="bg-red-500/20 text-red-400 hover:bg-red-500/30">
                            <LogOut className="mr-2" size={16} />
                            Logout
                        </Button>
                    </div>
                ) : (
                    <div className="flex gap-2">
                        <Link href="/login" className="text-blue-400 hover:text-blue-300">
                            Login
                        </Link>
                        <Link href="/signup" className="text-green-400 hover:text-green-300">
                            Sign Up
                        </Link>
                    </div>
                )}
            </nav>

            {/* Enrutamiento simulado */}
            <main>
                {isAuthenticated ? (
                    <BoardProvider>
                        <BoardPage />
                    </BoardProvider>
                ) : (
                    // Simulación de enrutamiento básico.  En una app real de Next.js, usarías el sistema de enrutamiento de Next.js.
                    (router.pathname === '/login' ? <LoginPage /> : <SignupPage />)
                )}
            </main>
        </div>
    );
};

const WrappedApp = () => {
    return (
        <AuthProvider>
            <App />
        </AuthProvider>
    )
}

export default WrappedApp;

