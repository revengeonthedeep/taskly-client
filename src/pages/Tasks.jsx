import { useState, useEffect } from 'react';
import { useUser } from '../../context/UserContext';
import { API_BASE_URL } from '../util';
import { Link, useSearchParams } from 'react-router-dom';
import {
    Badge,
    Box,
    Button,
    Flex,
    Heading,
    Select,
    Table,
    Thead,
    Tbody,
    Tr,
    Th,
    Td,
    TableContainer,
} from '@chakra-ui/react';
import TasksSkeleton from '../_skeletons/TasksSkeleton';
import Pagination from '../../components/Pagination';
import { BsArrowUp, BsArrowDown } from 'react-icons/bs';

export default function Tasks() {
    const { user } = useUser();
    const [tasks, setTasks] = useState();
    const [searchParams, setSearchParams] = useSearchParams();
    const [itemCount, setItemCount] = useState(0);
    const page = parseInt(searchParams.get('page'), 10) || 1;
    const [sortDirection, setSortDirection] = useState('asc'); // Для направления сортировки

    const handleStatusFilter = (e) => {
        const value = e.target.value;
        if (value) {
            searchParams.set('status', value);
        } else {
            searchParams.delete('status');
        }
        setSearchParams(searchParams);
    };

    const handleOrderBy = (value) => {
        const currentOrderBy = searchParams.get('orderBy');
        const newDirection = currentOrderBy === value && sortDirection === 'asc' ? 'desc' : 'asc';

        searchParams.set('orderBy', value);
        searchParams.set('sortDirection', newDirection);
        setSearchParams(searchParams);
        setSortDirection(newDirection); // Обновляем состояние направления
    };

    useEffect(() => {
        const fetchTasks = async () => {
            const query = searchParams.size ? `?${searchParams.toString()}` : '';
            const res = await fetch(`${API_BASE_URL}/tasks/user/${user._id}${query}`, {
                credentials: 'include',
            });
            const { tasks, taskCount } = await res.json();
            setTasks(tasks);
            setItemCount(taskCount);
        };

        if (user?._id) {
            fetchTasks();
        }
    }, [searchParams, user]);

    if (!tasks) {
        return <TasksSkeleton />;
    }

    return (
        <Box p="5" maxW="3lg" mx="auto">
            <Heading as="h1" fontSize="3xl" fontWeight="semibold" textAlign="center" my="7">
                Tasks to do
            </Heading>

            <Flex justify="space-between" mt="5" mb="3">
                <Box w="100px">
                    <Select placeholder="All" onChange={handleStatusFilter}>
                        <option value="open">Open</option>
                        <option value="done">Done</option>
                    </Select>
                </Box>
                <Button colorScheme="green" textTransform="uppercase" fontWeight="semibold">
                    <Link to="/create-task">Create New Task</Link>
                </Button>
            </Flex>

            <TableContainer overflowX="auto">
    <Table px="3" border="2px solid" borderColor="gray.100">
        <Thead backgroundColor="gray.100">
            <Tr>
                <Th>
                    <Flex onClick={() => handleOrderBy('name')} cursor="pointer" alignItems="center">
                        Task{' '}
                        {searchParams.get('orderBy') === 'name' && (
                            sortDirection === 'asc' ? <BsArrowUp /> : <BsArrowDown />
                        )}
                    </Flex>
                </Th>
                <Th>
                    <Flex onClick={() => handleOrderBy('priority')} cursor="pointer" alignItems="center">
                        Priority{' '}
                        {searchParams.get('orderBy') === 'priority' && (
                            sortDirection === 'asc' ? <BsArrowUp /> : <BsArrowDown />
                        )}
                    </Flex>
                </Th>
                <Th>
                    <Flex onClick={() => handleOrderBy('category')} cursor="pointer" alignItems="center">
                        Category{' '}
                        {searchParams.get('orderBy') === 'category' && (
                            sortDirection === 'asc' ? <BsArrowUp /> : <BsArrowDown />
                        )}
                    </Flex>
                </Th>
                <Th>
                    <Flex onClick={() => handleOrderBy('status')} cursor="pointer" alignItems="center">
                        Status{' '}
                        {searchParams.get('orderBy') === 'status' && (
                            sortDirection === 'asc' ? <BsArrowUp /> : <BsArrowDown />
                        )}
                    </Flex>
                </Th>
                <Th>
                    <Flex onClick={() => handleOrderBy('due')} cursor="pointer" alignItems="center">
                        Due Date{' '}
                        {searchParams.get('orderBy') === 'due' && (
                            sortDirection === 'asc' ? <BsArrowUp /> : <BsArrowDown />
                        )}
                    </Flex>
                </Th>
                <Th>
                    <Flex onClick={() => handleOrderBy('createdAt')} cursor="pointer" alignItems="center">
                        Created At{' '}
                        {searchParams.get('orderBy') === 'createdAt' && (
                            sortDirection === 'asc' ? <BsArrowUp /> : <BsArrowDown />
                        )}
                    </Flex>
                </Th>
            </Tr>
        </Thead>
        <Tbody>
            {tasks.map((task) => (
                <Tr key={task._id}>
                    <Td>
                        <Link to={`/tasks/${task._id}`}>{task.name}</Link>
                    </Td>
                    <Td>
                        <Badge colorScheme={task.priority === 'urgent' ? 'red' : 'gray'}>
                            {task.priority}
                        </Badge>
                    </Td>
                    <Td>{task.category || "N/A"}</Td> {/* Отображаем категорию задачи */}
                    <Td>
                        <Badge colorScheme={task.status === 'open' ? 'orange' : 'green'}>
                            {task.status}
                        </Badge>
                    </Td>
                    <Td>{task.due ? new Date(task.due).toDateString() : ''}</Td>
                    <Td>{task.createdAt ? new Date(task.createdAt).toDateString() : ''}</Td>
                </Tr>
            ))}
        </Tbody>
    </Table>
</TableContainer>

            <Pagination itemCount={itemCount} pageSize={4} currentPage={page} />
        </Box>
    );
}
