import { StyleSheet, Text, View, Image, Dimensions, Pressable, TouchableOpacity } from 'react-native'
import React, { useMemo, useCallback } from 'react'
import { ReelThumbnail } from './reels_feed'
import { VideoThumbnail } from './videos_feed'
import { PostThumbnail } from './posts_feed'
import { icons } from '@/constants/icons'
import { useNavigation } from '@react-navigation/native'

const { width } = Dimensions.get('window')

// Define proper TypeScript interfaces
interface PostBy {
    first_name: string
    last_name: string
}

interface VideoData {
    thumbnail_url: string
}

interface ReelsData {
    video_url: string
    thumbnail_url?: string
}

interface SearchResultProps {
    post_id: string
    video_data?: VideoData
    reels_data?: ReelsData
    post_description?: string
    post_type: 'post' | 'reel'
    post_title: string
    post_by: PostBy
    username: string
    post_banner?: string
    created_at: string
}

// Map post types to view types for cleaner logic
const POST_TYPE_MAPPING = {
    'post': 'post',
    'reel': 'reel'
} as const

// In SearchResult.tsx - Fix the handler calls and prop passing

const SearchResult: React.FC<SearchResultProps> = ({
    post_id,
    video_data,
    reels_data,
    post_description,
    post_type,
    post_title,
    post_by,
    username,
    post_banner,
    created_at
}) => {
    const navigation = useNavigation()

    // Memoize the post type view to avoid recalculation
    const post_type_view = useMemo(() => {
        return POST_TYPE_MAPPING[post_type] || 'post'
    }, [post_type])

    // Fix: Ensure postId is properly typed and handled
    const handleReelPress = useCallback((postId: string) => {
        console.log('Reel pressed:', postId)
        if (postId) {
            navigation.navigate('reel' as never, { postId })
        }
    }, [navigation])

    const handleVideoPress = useCallback((postId: string) => {
        if (postId) {
            navigation.navigate('video' as never, { postId })
        }
    }, [navigation])



    const handleOptionsPress = useCallback(() => {
        console.log('Options pressed for:', post_id)
    }, [post_id])

    // Memoize thumbnail URL for reels
    const reelThumbnailUrl = useMemo(() => {
        if (!reels_data?.video_url) return null
        return reels_data.video_url.replace('.mp4', '.jpg')
    }, [reels_data?.video_url])

    // Render different content types
    const renderContent = () => {
        switch (post_type_view) {
            case 'reel':
                return (
                    <View style={styles.thumbnail_container}>
                        <TouchableOpacity
                            onPress={() => handleReelPress(post_id)}
                        >
                            <ReelThumbnail
                                reel_per_column={3}
                                style={styles.reel_results}
                                post_id={post_id} // Pass the post_id correctly
                                reel_title={post_title}
                                reel_by={post_by}
                                username={username}
                                reel_thumbnail={reelThumbnailUrl}
                                onPress={handleReelPress} // Pass the handler function
                            />
                        </TouchableOpacity>
                    </View>
                )

            case 'post':
                return (
                    <View style={styles.thumbnail_container}>
                        <TouchableOpacity
                            onPress={() => navigation.navigate('post', { id: post_id })}
                            >
                            <PostThumbnail
                                post_id={post_id}
                                post_title={post_title}
                                post_desc={post_description}
                                post_by={post_by}
                                username={username}
                                post_thumbnail={post_banner}
                                onPress={() => { }}
                                created_at={created_at}
                            />
                        </TouchableOpacity>
                    </View>
                )

            default:
                return (
                    <Pressable
                        style={styles.fallback_container}
                        // onPress={() => router.push(`../${post_type_view}/${post_id}`)}
                    >
                        <Text style={styles.fallback_title} numberOfLines={2}>
                            {post_title}
                        </Text>
                        <Text style={styles.fallback_author}>
                            {post_by.first_name} {post_by.last_name}
                        </Text>
                        {reels_data?.thumbnail_url ? (
                            <Image
                                source={{ uri: reels_data.thumbnail_url }}
                                style={styles.fallback_image}
                                resizeMode="cover"
                            />
                        ) : (
                            <View style={styles.no_thumbnail}>
                                <Text style={styles.no_thumbnail_text}>No thumbnail available</Text>
                            </View>
                        )}
                    </Pressable>
                )
        }
    }

    return renderContent()
}

const styles = StyleSheet.create({
    thumbnail_container: {
        width: width * 0.9,
        height: (width * 9 / 16) + 30,
        marginVertical: 10,
        marginHorizontal: 'auto',
        borderRadius: 12,
        overflow: 'hidden',
        backgroundColor: '#fff',
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        justifyContent: 'center',
        alignItems: 'center',
    },

    reel_results: {
        margin: 'auto',
    },

    options_button: {
        position: 'absolute',
        bottom: 15,
        right: 15,
        padding: 8,
        borderRadius: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
    },

    reel_thumb_options: {
        width: 20,
        height: 20,
    },

    fallback_container: {
        width: width * 0.9,
        marginVertical: 10,
        marginHorizontal: 'auto',
        padding: 16,
        borderRadius: 12,
        backgroundColor: '#fff',
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.05,
        shadowRadius: 2,
    },

    fallback_title: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1a1a1a',
        marginBottom: 8,
        lineHeight: 22,
    },

    fallback_author: {
        fontSize: 14,
        color: '#666',
        marginBottom: 12,
    },

    fallback_image: {
        width: '100%',
        height: 120,
        borderRadius: 8,
        backgroundColor: '#f0f0f0',
    },

    no_thumbnail: {
        width: '100%',
        height: 120,
        borderRadius: 8,
        backgroundColor: '#f8f8f8',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#e0e0e0',
        borderStyle: 'dashed',
    },

    no_thumbnail_text: {
        fontSize: 14,
        color: '#999',
        fontStyle: 'italic',
    },
})

export default SearchResult