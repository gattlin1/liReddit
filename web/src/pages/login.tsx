import React from 'react';
import { Form, Formik } from 'formik';
import Wrapper from '../components/Wrapper';
import InputField from '../components/InputField';
import { Box, Button, Link } from '@chakra-ui/react';
import { MeDocument, MeQuery, useLoginMutation } from '../generated/graphql';
import { toErrorMap } from '../utils/toErrorsMap';
import { useRouter } from 'next/router';
import NextLink from 'next/link';
import { withApollo } from '../utils/withApollo';

function Login() {
  const router = useRouter();
  const [login] = useLoginMutation();
  return (
    <Wrapper variant='small'>
      <Formik
        initialValues={{ usernameOrEmail: '', password: '' }}
        onSubmit={async (values, { setErrors }) => {
          const response = await login({
            variables: values,
            update: (cache, { data }) => {
              cache.writeQuery<MeQuery>({
                query: MeDocument,
                data: {
                  __typename: 'Query',
                  me: data?.login.user,
                },
              });
              cache.evict({ fieldName: 'posts:{}' });
            },
          });

          if (response.data?.login.errors) {
            setErrors(toErrorMap(response.data.login.errors));
          } else if (response.data?.login.user) {
            if (typeof router.query.next === 'string') {
              router.push(router.query.next);
            } else {
              router.push('/');
            }
          }
        }}
      >
        {({ isSubmitting }) => (
          <Form>
            <InputField
              name='usernameOrEmail'
              label='Username or Email'
              placeholder='Username or Email'
            />
            <Box mt={4}>
              <InputField
                name='password'
                label='Password'
                placeholder='Password'
                type='password'
              />
            </Box>
            <Box mt={4}>
              <Button isLoading={isSubmitting} type='submit' color='teal'>
                Login
              </Button>
              <Box mt={2}>
                <NextLink href='/forgot-password'>
                  <Link ml={2} color='teal'>
                    Forgot Password?
                  </Link>
                </NextLink>
              </Box>
              <Box>
                <NextLink href='/register'>
                  <Link ml={2} color='teal'>
                    Don't have an account? Register here
                  </Link>
                </NextLink>
              </Box>
            </Box>
          </Form>
        )}
      </Formik>
    </Wrapper>
  );
}

export default withApollo({ ssr: false })(Login);
