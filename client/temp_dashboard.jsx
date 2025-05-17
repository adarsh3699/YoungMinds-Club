import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import EventCard from '../../components/organizer/EventCard';
import XPProgressBar from '../../components/user/XPProgressBar';
import { Tabs } from '../../components/common';
import { Link } from 'react-router-dom';
