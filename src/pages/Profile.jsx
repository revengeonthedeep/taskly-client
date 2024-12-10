import { useForm } from 'react-hook-form';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useDisclosure } from '@chakra-ui/react';
import DeleteConfirmation from '../../components/DeleteConfirmation.jsx';
import { useUser } from '../../context/UserContext.jsx';
import { API_BASE_URL } from '../util.js';
import { useState } from 'react';
import { Controller } from 'react-hook-form';
import { AvatarUploader } from '../../components/AvatarUploader.jsx';
import toast from 'react-hot-toast';
import {
    Box,
    Heading,
    Center,
    Image,
    Input,
    Stack,
    FormControl,
    Button,
    Link,
    Flex,
    Text,
    FormErrorMessage,
} from '@chakra-ui/react';

export default function Profile() {
    const { isOpen, onOpen, onClose } = useDisclosure();
    const navigate = useNavigate();
    const [files, setFiles] = useState(false);
    const { user, updateUser } = useUser();
    const {
        control,
        register,
        handleSubmit,
        resetField,
        formState: { errors, isSubmitting },
    } = useForm({
        defaultValues: {
            avatar: user.avatar,
            username: user.username,
            email: user.email,
        },
    });

    const doSubmit = async values => {
        try {
            if (files.length > 0) {
                const newUrl = await handleFileUpload(files);
                if (newUrl) {
                    values.avatar = newUrl;
                }
            }
                const res = await fetch(`${API_BASE_URL}/users/update/${user._id}`, {
                    method: 'PATCH',
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(values),
                });
                const data = await res.json();

                if (res.status === 200) {
                    resetField('password');
                    updateUser(data);
                    toast.success('Profile Updated');
                } else {
                    toast.error(data.message);
                }
            
        } catch (error) {
            toast.error('Profile Update Error: ' + error.message);
        }
    };

    const handleFileUpload = async files => {
        const formData = new FormData();
        formData.append('image', files[0]);

        try {
            const res = await fetch(`${API_BASE_URL}/image/upload`, {
                method: 'POST',
                credentials: 'include',
                body: formData,
            });
            const response = await res.json();
            return response.imageUrl;
        } catch (error) {
            console.error(error);
            throw error;
        }
    };

    const handleDeleteUser = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/users/delete/${user._id}`, {
                method: 'DELETE',
                credentials: 'include',
            });
            const data = await res.json();

            if (res.status === 200) {
                toast.success(data.message);
                updateUser(null);
                navigate('/');
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error('Delete Error: ' + error.message);
        }
    };

    const handleSignOut = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/auth/signout`, {
                credentials: 'include',
            });
            const data = await res.json();
            toast.success(data.message);
            updateUser(null);
            navigate('/');
        } catch (error) {
            toast.error('Sign Out Error: ' + error.message);
        }
    };

    return (
        <Box p='3' maxW='lg' mx='auto'>
            <DeleteConfirmation
                alertTitle='Delete Account'
                handleClick={handleDeleteUser}
                isOpen={isOpen}
                onClose={onClose}
            />
            <Heading
                as='h1'
                fontSize='3xl'
                fontWeight='semibold'
                textAlign='center'
                my='7'
            >
                Your Profile
            </Heading>
            <form onSubmit={handleSubmit(doSubmit)}>
                <Stack gap='4'>
                    <Center>
                        <Controller
                            name='avatar'
                            control={control}
                            rules={{ required: true }}
                            render={({ field }) => (
                                <AvatarUploader
                                    onFieldChange={field.onChange}
                                    imageUrl={field.value}
                                    setFiles={setFiles}
                                />
                            )}
                        />
                    </Center>
                    <FormControl isInvalid={errors.username}>
                        <Input
                            id='username'
                            type='text'
                            placeholder='username'
                            {...register('username', { required: 'Username is required' })}
                        />
                        <FormErrorMessage>
                            {errors.username && errors.username.message}
                        </FormErrorMessage>
                    </FormControl>
                    <FormControl isInvalid={errors.email}>
                        <Input
                            id='email'
                            type='email'
                            placeholder='email'
                            {...register('email', { required: 'Email is required' })}
                        />
                        <FormErrorMessage>
                            {errors.email && errors.email.message}
                        </FormErrorMessage>
                    </FormControl>
                    <FormControl isInvalid={errors.password}>
                        <Input
                            id='password'
                            type='password'
                            placeholder='New password'
                            {...register('password', { required: 'Password is required' })}
                        />
                        <FormErrorMessage>
                            {errors.password && errors.password.message}
                        </FormErrorMessage>
                    </FormControl>
                    <Button
                        type='submit'
                        isLoading={isSubmitting}
                        colorScheme='teal'
                        textTransform='uppercase'
                    >
                        Update Profile
                    </Button>
                </Stack>
            </form>
            <Stack gap='4' mt='5'>
                <Link
                    as={RouterLink}
                    to='/create-task'
                    p='2'
                    bg='green.500'
                    rounded='lg'
                    textTransform='uppercase'
                    textAlign='center'
                    textColor='white'
                    fontWeight='semibold'
                    _hover={{ bg: 'green.600' }}
                >
                    Create New Task
                </Link>
                <Flex justify='space-between'>
                    <Text
                        as='span'
                        color='red.600'
                        cursor='pointer'
                        onClick={onOpen}
                    >
                        Delete Account
                    </Text>
                    <Text
                        as='span'
                        color='red.600'
                        cursor='pointer'
                        onClick={handleSignOut}
                    >
                        Sign Out
                    </Text>
                </Flex>
                <Text textAlign='center'>
                    <Link
                        as={RouterLink}
                        to='/tasks'
                        color='teal'
                        _hover={{ textDecor: 'none' }}
                    >
                        Show Tasks
                    </Link>
                </Text>
            </Stack>
        </Box>
    );
}
