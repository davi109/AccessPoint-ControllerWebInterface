import React from 'react';

import './styles.css';

import Spinner from 'react-spinkit';

const Loading = ({ loading, message }) => {
    return loading ? (
        <div className='overlay-content'>
            <div className='wrapper'>
                <Spinner
                    name='double-bounce'
                    fadeIn='none'
                    color='blue'
                />
                <span className='message'>
                    {message}
                </span>
            </div>
        </div>
    ) : null
}

export default Loading;