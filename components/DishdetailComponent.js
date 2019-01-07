import React, { Component } from 'react';
import { Text, View, ScrollView, FlatList, Modal, StyleSheet,
    Button, Alert, PanResponder, Share } from 'react-native';
import { Card, Icon, Input, Rating } from 'react-native-elements';
import { connect } from 'react-redux';
import { baseUrl } from '../shared/baseUrl';
import { postFavorite, postComment } from '../redux/ActionCreators';
import * as Animatable from 'react-native-animatable';

const mapStateToProps = state => {
    return {
        dishes: state.dishes,
        comments: state.comments,
        favorites: state.favorites
    }
}

const mapDispatchToProps = dispatch => ({
    postFavorite: (dishId) => dispatch(postFavorite(dishId)),
    postComment: (comment) => dispatch(postComment(comment))
})



function RenderDish(props) {
    const dish = props.dish;

    handleViewRef = ref => this.view = ref;

    const recognizeComment = ({ moveX, moveY, dx, dy }) => {
        return (dx > 200) ? true : false;
    }

    const recognizeFavorite = ({ moveX, moveY, dx, dy }) => {
        return (dx < -200) ? true : false;
    }

    const shareDish = (title, message, url) => {
        Share.share({
            title: title,
            message: title + ': ' + message + ' ' + url,
            url: url
        },{
            dialogTitle: 'Share ' + title
        })
    }

    const panResponder = PanResponder.create({
        onStartShouldSetPanResponder: (e, gestureState) => {
            return true;
        },

        onPanResponderGrant: () => {this.view.rubberBand(1000).then(endState =>
          console.log(endState.finished ? 'finished' : 'cancelled'));},

        onPanResponderEnd: (e, gestureState) => {
            if (recognizeComment(gestureState))
                  props.toggleModal();
            else if (recognizeFavorite(gestureState))
              Alert.alert(
                  'Add Favorite',
                  'Are you sure you wish to add ' + dish.name + ' to favorite?',
                  [
                  {
                    text: 'Cancel',
                    onPress: () => console.log('Cancel Pressed'),
                    style: 'cancel'},
                  {
                    text: 'OK',
                    onPress: () => {props.favorite ? console.log('Already favorite') : props.onPress()}},
                  ],
                  { cancelable: false }
              );

            return true;
        }
    })

    if (dish != null) {
        return(
          <Animatable.View animation="fadeInDown" duration={2000} delay={1000}
              ref={this.handleViewRef}
              {...panResponder.panHandlers}>
            <Card
              featuredTitle={dish.name}
              image={{uri: baseUrl + dish.image}}>
              <Text style={{margin: 10}}>
                  {dish.description}
              </Text>
              <View style={{flex:1, flexDirection:'row',  justifyContent: 'center'}}>
              <Icon
                raised
                reverse
                name={ props.favorite ? 'heart' : 'heart-o'}
                type='font-awesome'
                color='#f50'
                onPress={() => props.favorite ? console.log('Already favorite') : props.onPress()}
              />
              <Icon
                raised
                reverse
                name='pencil'
                type='font-awesome'
                color='#512DA8'
                onPress={() => props.toggleModal()}
              />
              <Icon
                  raised
                  reverse
                  name='share'
                  type='font-awesome'
                  color='#51D2A8'
                  onPress={() => shareDish(dish.name, dish.description, baseUrl + dish.image)} />
              </View>
            </Card>
          </Animatable.View>
        );
    } else {
        return(<View></View>);
    }
}

function RenderComments(props) {
    const comments = props.comments;

    const renderCommentItem = ({item, index}) => {
        return(
            <View key={index} style={{margin: 10}}>
                <Text style={{fontSize: 14}}>{item.comment}</Text>
                <Text style={{fontSize: 12}}>{item.rating} Stars</Text>
                <Text style={{fontSize: 12}}>{'--' + item.author + ', ' + item.date.substring(0, 10)}</Text>
            </View>
        )
    }

    return(
      <Animatable.View animation="fadeInUp" duration={2000} delay={1000}>
        <Card title="Comments">
            <FlatList data={comments}
            renderItem={renderCommentItem}
            keyExtractor={ item => item.id.toString()} />
        </Card>
      </Animatable.View>
    )
}

class DishDetail extends Component {
    constructor(props) {
        super(props);

        this.state = {
            showModal: false,
            rating: 3,
            author: '',
            comment: ''
        }

        this.toggleModal = this.toggleModal.bind(this);
        this.ratingCompleted = this.ratingCompleted.bind(this);
    }

    markFavorite(dishId) {
        this.props.postFavorite(dishId);
    }

    static navigationOptions = {
        title: 'Dish Details'
    }

    toggleModal() {
        this.setState({ showModal: !this.state.showModal });
    }

    ratingCompleted(rating) {
        this.setState({rating: rating})
    }

    handleComment(dishId, rating, author, comment) {
//        console.log("handleComment: "+dishId+", "+rating+", "+author+", "+comment)
        this.props.postComment({dishId, rating, author, comment});
        this.toggleModal();
    }


    render() {
      const dishId = this.props.navigation.getParam('dishId', '');
      const tmp_comments=this.props.comments.comments.filter(
          comment => comment.dishId === dishId)
        return(
          <ScrollView>
              <RenderDish
                  dish={this.props.dishes.dishes[+dishId]}
                  favorite={this.props.favorites.some( el => el === dishId)}
                  onPress={ () => this.markFavorite(dishId)}
                  toggleModal={ () => this.toggleModal()}
              />
              <RenderComments comments={this.props.comments.comments.filter( comment => comment.dishId === dishId)} />

              <Modal
               animationType={"slide"}
               transparent={false}
               visible={this.state.showModal}
               onDismiss={ () => this.toggleModal() }
               onRequestClose={ () => this.toggleModal() }
              >
                <ScrollView>
                   <Rating style={{paddingVertical:40}}
                     showRating
                     type="star"
                     imageSize={40}
                     startingValue={3}
                     fraction={1}
                     onFinishRating={this.ratingCompleted}
                   />

                   <Input
                       placeholder="Author"
                       leftIcon={{ type: 'font-awesome', name: 'user-o' }}
                       onChangeText={ author => this.setState({ author })}
                   />

                   <Input
                       placeholder="Comment"
                       leftIcon={{ type: 'font-awesome', name: 'comment-o' }}
                       onChangeText={ comment => this.setState({ comment })}
                   />

                   <View style={styles.formRow}>
                     <Button
                           onPress={() => this.handleComment(dishId,
                             this.state.rating,
                             this.state.author,
                             this.state.comment)}
                         title="Submit"
                         color='#512DA8'
                         accessibilityLabel="Submit"
                     />
                   </View>

                   <View style={styles.formRow}>
                      <Button
                          onPress={this.toggleModal}
                          title="Dismiss"
                          color="#888"
                          accessibilityLabel="Dismiss"
                      />
                    </View>
                </ScrollView>
             </Modal>
          </ScrollView>
    )};
}

const styles = StyleSheet.create({
    formRow: {
      alignItems: 'center',
      justifyContent: 'center',
      flex: 1,
      flexDirection: 'row',
      margin: 20
    }
});

export default connect(mapStateToProps, mapDispatchToProps)(DishDetail);
