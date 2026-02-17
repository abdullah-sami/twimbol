{/* Main Implementation Components:

ParentalControlProvider - Context provider to wrap your entire app
TimeLimitChecker - Blocks content when daily time limit is reached
TimeRestrictionChecker - Blocks content during bedtime hours
ContentBlocker - Filters content based on keywords and blocked users
UsageWarning - Shows warnings when approaching time limits
UsageTracker Hook - Tracks time spent in different screens

Key Features:

Time Management: Automatic daily usage tracking and time limit enforcement
Content Filtering: Keyword-based content blocking and user blocking
Bedtime Mode: Automatic restrictions during specified hours
Watch History: Logs all viewed content for parent review
Usage Warnings: Alerts users when approaching limits

Integration Steps:

Wrap your App:

jsx<ParentalControlProvider>
  <TimeLimitChecker>
    <TimeRestrictionChecker>
      <YourApp />
    </TimeRestrictionChecker>
  </TimeLimitChecker>
</ParentalControlProvider>

Add to Video Lists:

jsx<ContentBlocker content={video.title} creator={video.creator}>
  <VideoComponent />
</ContentBlocker>

Track Usage in Video Players:

jsxconst { startTracking, stopTracking } = useUsageTracker();
// Call startTracking() when video starts
// Call stopTracking() when video ends

Filter Search Results:

jsxconst { checkContent } = useContentFilter();
const { isUserBlocked } = useBlockedUsers();
// Filter your results arrays


*/}






import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import {
    ParentalControlProvider,
    TimeLimitChecker,
    TimeRestrictionChecker,
    ContentBlocker,
    UsageWarning,
    useUsageTracker,
    useContentFilter,
    useBlockedUsers,
    logWatchHistory,
} from './parentalcontrolsmanager';

// Example 1: Wrap your main App component
const App = () => {
    return (
        <ParentalControlProvider>
            <TimeLimitChecker onTimeLimitExceeded={() => console.log('Time limit exceeded!')}>
                <TimeRestrictionChecker onTimeRestricted={() => console.log('In bedtime mode!')}>
                    <MainAppContent />
                </TimeRestrictionChecker>
            </TimeLimitChecker>
        </ParentalControlProvider>
    );
};

// Example 2: Video/Content List Component with filtering
const VideoListComponent = ({ videos }) => {
    const { checkContent } = useContentFilter();
    const { isUserBlocked } = useBlockedUsers();

    // Filter videos based on parental controls
    const filteredVideos = videos.filter(video => {
        const contentCheck = checkContent(video.title + ' ' + video.description);
        const creatorBlocked = isUserBlocked(video.creator);
        return contentCheck.allowed && !creatorBlocked;
    });

    const renderVideo = ({ item }) => (
        <ContentBlocker
            content={item.title + ' ' + item.description}
            creator={item.creator}
            fallback={
                <View style={styles.hiddenVideo}>
                    <Text style={styles.hiddenText}>Video Hidden by Parental Controls</Text>
                </View>
            }
        >
            <TouchableOpacity 
                style={styles.videoItem}
                onPress={() => handleVideoPress(item)}
            >
                <Text style={styles.videoTitle}>{item.title}</Text>
                <Text style={styles.videoCreator}>@{item.creator}</Text>
            </TouchableOpacity>
        </ContentBlocker>
    );

    const handleVideoPress = (video) => {
        // Log to watch history
        logWatchHistory({
            id: video.id,
            title: video.title,
            creator: video.creator,
            watchDuration: 0, // Will be updated when video ends
        });
        // Navigate to video player
    };

    return (
        <View style={styles.container}>
            <UsageWarning />
            <FlatList
                data={filteredVideos}
                renderItem={renderVideo}
                keyExtractor={item => item.id}
            />
        </View>
    );
};

// Example 3: Video Player Component with usage tracking
const VideoPlayerComponent = ({ video, onVideoEnd }) => {
    const { startTracking, stopTracking } = useUsageTracker();
    const [watchStartTime, setWatchStartTime] = useState(null);

    useEffect(() => {
        // Start tracking when component mounts
        startTracking();
        setWatchStartTime(Date.now());

        return () => {
            // Stop tracking when component unmounts
            stopTracking();
            handleVideoEnd();
        };
    }, []);

    const handleVideoEnd = async () => {
        if (watchStartTime) {
            const watchDuration = Math.round((Date.now() - watchStartTime) / 1000);
            
            // Update watch history with actual duration
            await logWatchHistory({
                id: video.id,
                title: video.title,
                creator: video.creator,
                watchDuration: watchDuration,
                url: video.url,
            });

            if (onVideoEnd) {
                onVideoEnd(watchDuration);
            }
        }
    };

    return (
        <ContentBlocker
            content={video.title + ' ' + video.description}
            creator={video.creator}
        >
            <View style={styles.playerContainer}>
                <UsageWarning />
                {/* Your video player component here */}
                <Text style={styles.videoTitle}>{video.title}</Text>
                <Text style={styles.videoCreator}>by @{video.creator}</Text>
                {/* Video controls, etc. */}
            </View>
        </ContentBlocker>
    );
};

// Example 4: Search Component with content filtering
const SearchComponent = ({ searchQuery, onSearchResults }) => {
    const { checkContent } = useContentFilter();
    const { isUserBlocked } = useBlockedUsers();
    const [results, setResults] = useState([]);

    const performSearch = async (query) => {
        try {
            // Perform your normal search
            const rawResults = await searchAPI(query);
            
            // Filter results based on parental controls
            const filteredResults = rawResults.filter(item => {
                const contentCheck = checkContent(item.title + ' ' + item.description);
                const creatorBlocked = isUserBlocked(item.creator);
                return contentCheck.allowed && !creatorBlocked;
            });

            setResults(filteredResults);
            if (onSearchResults) {
                onSearchResults(filteredResults);
            }
        } catch (error) {
            console.error('Search error:', error);
        }
    };

    return (
        <View style={styles.searchContainer}>
            {/* Search input and other components */}
            <FlatList
                data={results}
                renderItem={({ item }) => (
                    <ContentBlocker
                        content={item.title + ' ' + item.description}
                        creator={item.creator}
                    >
                        <SearchResultItem item={item} />
                    </ContentBlocker>
                )}
                keyExtractor={item => item.id}
            />
        </View>
    );
};

// Example 5: Profile/User Component with blocking check
const UserProfileComponent = ({ username, children }) => {
    const { isUserBlocked } = useBlockedUsers();

    if (isUserBlocked(username)) {
        return (
            <View style={styles.blockedProfile}>
                <Text style={styles.blockedProfileTitle}>🚫 User Blocked</Text>
                <Text style={styles.blockedProfileText}>
                    @{username} is blocked by parental controls
                </Text>
            </View>
        );
    }

    return children;
};

// Example 6: Comments Section with content filtering
const CommentsComponent = ({ comments }) => {
    const { checkContent } = useContentFilter();
    const { isUserBlocked } = useBlockedUsers();

    const filteredComments = comments.filter(comment => {
        const contentCheck = checkContent(comment.text);
        const userBlocked = isUserBlocked(comment.author);
        return contentCheck.allowed && !userBlocked;
    });

    const renderComment = ({ item }) => (
        <ContentBlocker
            content={item.text}
            creator={item.author}
            fallback={
                <View style={styles.hiddenComment}>
                    <Text style={styles.hiddenText}>Comment hidden by parental controls</Text>
                </View>
            }
        >
            <View style={styles.commentItem}>
                <Text style={styles.commentAuthor}>@{item.author}</Text>
                <Text style={styles.commentText}>{item.text}</Text>
            </View>
        </ContentBlocker>
    );

    return (
        <View style={styles.commentsContainer}>
            <Text style={styles.commentsTitle}>Comments ({filteredComments.length})</Text>
            <FlatList
                data={filteredComments}
                renderItem={renderComment}
                keyExtractor={item => item.id}
            />
        </View>
    );
};

// Example 7: Navigation wrapper with time restrictions
const AppNavigator = ({ children }) => {
    return (
        <TimeLimitChecker 
            onTimeLimitExceeded={() => {
                // You could navigate to a specific screen or show an alert
                console.log('Redirecting due to time limit');
            }}
        >
            <TimeRestrictionChecker
                onTimeRestricted={() => {
                    console.log('App restricted due to bedtime');
                }}
            >
                {children}
            </TimeRestrictionChecker>
        </TimeLimitChecker>
    );
};

// Example 8: HOC (Higher Order Component) for pages that need parental control
export const withParentalControls = (WrappedComponent) => {
    return (props) => (
        <TimeLimitChecker>
            <TimeRestrictionChecker>
                <WrappedComponent {...props} />
            </TimeRestrictionChecker>
        </TimeLimitChecker>
    );
};

// Usage: export default withParentalControls(MyVideoScreen);

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    videoItem: {
        padding: 16,
        backgroundColor: '#f9f9f9',
        marginVertical: 4,
        borderRadius: 8,
    },
    videoTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    videoCreator: {
        fontSize: 14,
        color: '#666',
    },
    hiddenVideo: {
        padding: 16,
        backgroundColor: '#ffe6e6',
        marginVertical: 4,
        borderRadius: 8,
        alignItems: 'center',
    },
    hiddenText: {
        color: '#999',
        fontStyle: 'italic',
    },
    playerContainer: {
        flex: 1,
        backgroundColor: '#000',
    },
    searchContainer: {
        flex: 1,
        padding: 16,
    },
    blockedProfile: {
        padding: 20,
        backgroundColor: '#ffe6e6',
        borderRadius: 8,
        alignItems: 'center',
    },
    blockedProfileTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#ff4444',
        marginBottom: 8,
    },
    blockedProfileText: {
        fontSize: 14,
        color: '#666',
    },
    commentsContainer: {
        padding: 16,
    },
    commentsTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 12,
    },
    commentItem: {
        padding: 12,
        backgroundColor: '#f5f5f5',
        marginVertical: 4,
        borderRadius: 8,
    },
    commentAuthor: {
        fontSize: 14,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    commentText: {
        fontSize: 14,
    },
    hiddenComment: {
        padding: 12,
        backgroundColor: '#ffe6e6',
        marginVertical: 4,
        borderRadius: 8,
        alignItems: 'center',
    },
});

// Mock API function
const searchAPI = async (query) => {
    // Your search implementation
    return [];
};

export default App;